#!/usr/bin/env node
// Graphos — motor do grafo de memória para desenvolvimento spec-driven.
// Zero dependências (Node >= 18). Uso: node graphos.mjs <comando> [args]
//
// Comandos:
//   init                  cria a estrutura graphos/ (nodes, templates, index.json)
//   add <tipo> <slug>     cria um nó a partir do template e registra no índice
//   query <id>            imprime o subgrafo de 1 salto (contexto mínimo p/ prompt)
//   validate              valida o grafo (arestas órfãs, ids, status, drift)
//   order                 ordena as tasks por dependência (DAG / topological sort)
//   index                 reconstrói o index.json varrendo nodes/
// Opções globais: --root <dir> | --help | --version

import fs from 'node:fs'
import path from 'node:path'

const VERSION = '1.0.0'
const NODE_TYPES = ['spec', 'decision', 'task', 'module', 'learning', 'test']
const STATUS = {
  spec: ['draft', 'review', 'approved', 'implemented', 'done'],
  decision: ['proposed', 'accepted', 'superseded'],
  task: ['todo', 'in-progress', 'done', 'blocked'],
  module: ['stub', 'stable', 'deprecated'],
  learning: ['active', 'resolved'],
  test: ['planned', 'passing', 'failing'],
}

const DEFAULT_STATUS = {
  spec: 'draft',
  decision: 'proposed',
  task: 'todo',
  module: 'stub',
  learning: 'active',
  test: 'planned',
}

const TEMPLATES = {
  spec: `---
id: spec/<slug>
type: spec
status: draft
tags: []
relates: []
summary: ""
---

# Spec: <título>

## Objetivo
O que se quer alcançar e por quê.

## Escopo
O que está incluído.

## Fora de escopo
O que explicitamente NÃO está incluído.

## Requisitos
- [ ] Requisito mensurável e testável.

## Critérios de aceite
- [ ] Cada critério deve ser verificável de forma objetiva.
`,
  decision: `---
id: decision/<slug>
type: decision
status: proposed
tags: []
relates: []
summary: ""
---

# Decisão: <título>

## Contexto
O problema que motiva a decisão.

## Opções consideradas
| Opção | Prós | Contras |
|-------|------|---------|
| ...   | ...  | ...     |

## Decisão
O que foi escolhido e por quê.

## Consequências
O que muda, o que ganha, o que custa.
`,
  task: `---
id: task/<slug>
type: task
status: todo
tags: []
relates: []
summary: ""
---

# Tarefa: <título>

## Objetivo
O que esta tarefa entrega.

## Contexto necessário
Quais nós ler antes de começar (spec/decision/module).

## Passos
1. ...
2. ...

## Critérios de conclusão
- [ ] ...
`,
  module: `---
id: module/<slug>
type: module
status: stub
tags: []
relates: []
summary: ""
---

# Módulo: <nome>

## Caminho(s) no repositório
\`src/...\`

## Responsabilidade
O que este módulo faz.

## Interface pública
Funções/classes/endpoints principais.

## Dependências
\`relates\` para outros módulos.
`,
  learning: `---
id: learning/<slug>
type: learning
status: active
tags: []
relates: []
summary: ""
---

# Aprendizado: <título>

## Observação
O que foi constatado (bug, gotcha, padrão, achado de review).

## Causa / contexto
Por que aconteceu ou por que importa.

## Recomendação
O que fazer a respeito (e quem/quando).
`,
  test: `---
id: test/<slug>
type: test
status: planned
tags: []
relates: []
summary: ""
---

# Teste: <título>

## Objetivo
Qual critério de aceite da spec isto verifica.

## Plano
Casos a cobrir e como executar.

## Resultado
Veredito por critério + evidência (comando, saída resumida).
`,
}

// ── utilidades ──────────────────────────────────────────────────────────────

function rootDir() {
  const i = process.argv.indexOf('--root')
  if (i !== -1 && process.argv[i + 1]) return path.resolve(process.argv[i + 1])
  return process.env.GRAPHOS_ROOT ? path.resolve(process.env.GRAPHOS_ROOT) : process.cwd()
}

function graphosDir() {
  return path.join(rootDir(), 'graphos')
}

function nodesDir() {
  return path.join(graphosDir(), 'nodes')
}

function indexPath() {
  return path.join(graphosDir(), 'index.json')
}

function fail(msg) {
  console.error('erro: ' + msg)
  process.exit(1)
}

function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!m) return { meta: null, body: text }
  const meta = {}
  for (const line of m[1].split(/\r?\n/)) {
    const mm = line.match(/^([A-Za-z_][\w]*)\s*:\s*(.*)$/)
    if (!mm) continue
    const key = mm[1]
    const raw = mm[2].trim()
    if (raw.startsWith('[') && raw.endsWith(']')) {
      meta[key] = raw.slice(1, -1).split(',').map(s => s.trim().replace(/^"(.*)"$/, '$1')).filter(s => s.length > 0)
    } else {
      meta[key] = raw.replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1')
    }
  }
  return { meta, body: text.slice(m[0].length) }
}

function readIndex() {
  try {
    return JSON.parse(fs.readFileSync(indexPath(), 'utf8'))
  } catch {
    return { $schema: 'graphos/index', version: 1, nodes: {} }
  }
}

function writeIndex(index) {
  fs.writeFileSync(indexPath(), JSON.stringify(index, null, 2) + '\n', 'utf8')
}

function loadAllNodes() {
  const out = []
  const base = nodesDir()
  if (!fs.existsSync(base)) return out
  for (const type of NODE_TYPES) {
    const dir = path.join(base, type)
    if (!fs.existsSync(dir)) continue
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith('.md')) continue
      const file = path.join(dir, f)
      const { meta, body } = parseFrontmatter(fs.readFileSync(file, 'utf8'))
      out.push({ id: meta ? meta.id : null, type, file: path.relative(graphosDir(), file), meta, body })
    }
  }
  return out
}

function idParts(id) {
  const i = String(id).indexOf('/')
  if (i <= 0) return null
  return { type: id.slice(0, i), slug: id.slice(i + 1) }
}

// ── comandos ────────────────────────────────────────────────────────────────

function cmdInit() {
  const g = graphosDir()
  const tpl = path.join(g, 'templates')
  fs.mkdirSync(tpl, { recursive: true })
  for (const type of NODE_TYPES) {
    fs.mkdirSync(path.join(nodesDir(), type), { recursive: true })
    fs.writeFileSync(path.join(nodesDir(), type, '.gitkeep'), '', 'utf8')
  }
  for (const [type, content] of Object.entries(TEMPLATES)) {
    fs.writeFileSync(path.join(tpl, type + '.md'), content, 'utf8')
  }
  const index = { $schema: 'graphos/index', version: 1, nodes: {} }
  for (const type of NODE_TYPES) index.nodes[type] = []
  writeIndex(index)
  console.log('graphos/ inicializado em ' + g)
}

function cmdAdd(type, slug, title) {
  if (!NODE_TYPES.includes(type)) fail(`tipo inválido "${type}". Válidos: ${NODE_TYPES.join(', ')}`)
  if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) fail(`slug inválido "${slug}" (kebab-case).`)
  const id = `${type}/${slug}`
  const dir = path.join(nodesDir(), type)
  fs.mkdirSync(dir, { recursive: true })
  const file = path.join(dir, slug + '.md')
  if (fs.existsSync(file)) fail(`nó já existe: ${id}`)
  const content = TEMPLATES[type].replace('<slug>', slug).replace('<título>', title || slug).replace('<nome>', title || slug)
  fs.writeFileSync(file, content, 'utf8')
  const index = readIndex()
  if (!index.nodes[type]) index.nodes[type] = []
  index.nodes[type].push({ id, file: `nodes/${type}/${slug}.md`, status: DEFAULT_STATUS[type], tags: [], relates: [], summary: title || '' })
  writeIndex(index)
  console.log('criado: ' + id + '  (' + path.relative(rootDir(), file) + ')')
}

function cmdIndex() {
  const all = loadAllNodes()
  const index = { $schema: 'graphos/index', version: 1, nodes: {} }
  for (const type of NODE_TYPES) index.nodes[type] = []
  for (const n of all) {
    if (!n.meta || !n.meta.id) { console.error('aviso: nó sem id em ' + n.file); continue }
    ;(index.nodes[n.meta.type] || (index.nodes[n.meta.type] = [])).push({
      id: n.meta.id,
      file: n.file,
      status: n.meta.status || '',
      tags: n.meta.tags || [],
      relates: n.meta.relates || [],
      summary: n.meta.summary || '',
    })
  }
  writeIndex(index)
  console.log(`index.json reconstruído com ${all.length} nó(s).`)
}

function cmdValidate() {
  const index = readIndex()
  const all = loadAllNodes()
  const problems = []
  const seen = new Set()
  const diskIds = new Set()

  // index entries
  for (const type of NODE_TYPES) {
    for (const entry of index.nodes[type] || []) {
      const id = entry.id
      if (seen.has(id)) problems.push(`id duplicado no índice: ${id}`)
      seen.add(id)
      const parts = idParts(id)
      if (!parts) { problems.push(`id malformado: ${id}`); continue }
      if (parts.type !== type) problems.push(`id "${id}" está sob o tipo errado (${type}) no índice`)
      const file = path.join(graphosDir(), entry.file || '')
      if (!fs.existsSync(file)) problems.push(`arquivo não encontrado para ${id}: ${entry.file}`)
      else if (!entry.file) problems.push(`sem "file" no índice para ${id}`)
      if (!NODE_TYPES.includes(parts.type)) problems.push(`tipo inválido em ${id}`)
      const st = STATUS[parts.type]
      if (st && entry.status && !st.includes(entry.status)) problems.push(`status inválido "${entry.status}" em ${id} (válidos: ${st.join(', ')})`)
    }
  }

  // disk nodes + orphan edges
  for (const n of all) {
    diskIds.add(n.id)
    if (!n.meta) { problems.push(`sem front-matter: ${n.file}`); continue }
    if (!n.meta.id) problems.push(`nó sem id: ${n.file}`)
    if (n.meta.id && !NODE_TYPES.includes(n.meta.type)) problems.push(`tipo inválido "${n.meta.type}" em ${n.file}`)
    const st = STATUS[n.meta.type]
    if (st && n.meta.status && !st.includes(n.meta.status)) problems.push(`status inválido "${n.meta.status}" em ${n.file}`)
    for (const ref of n.meta.relates || []) {
      if (!ref) continue
      if (!seen.has(ref) && !diskIds.has(ref)) {
        // can't know yet if it's an index-only or disk-only id; collect all valid ids first below
      }
    }
  }

  // collect all valid ids (index ∪ disk)
  const validIds = new Set([...seen, ...diskIds])
  for (const n of all) {
    for (const ref of n.meta.relates || []) {
      if (!ref) continue
      if (!validIds.has(ref)) problems.push(`aresta órfã em ${n.id}: ${ref}`)
    }
  }

  // index drift: disk ids missing from index
  for (const id of diskIds) {
    if (!seen.has(id)) problems.push(`nó no disco mas ausente do índice: ${id} (rode "graphos index")`)
  }

  if (problems.length === 0) {
    console.log('✓ grafo válido: ' + all.length + ' nó(s), ' + seen.size + ' entrada(s) no índice.')
    return
  }
  console.error('✗ ' + problems.length + ' problema(s):')
  for (const p of problems) console.error('  - ' + p)
  process.exit(1)
}

function cmdOrder() {
  const all = loadAllNodes()
  const tasks = all.filter(n => n.meta && n.meta.type === 'task')
  const ids = new Set(all.map(n => n.id))
  // edge: task -> dependsOn (relates that point to another task)
  const deps = new Map() // id -> Set of task ids it depends on
  for (const t of tasks) deps.set(t.id, new Set())
  for (const t of tasks) {
    for (const ref of t.meta.relates || []) {
      if (deps.has(ref)) deps.get(t.id).add(ref)
    }
  }
  // Kahn topological sort
  const indeg = new Map()
  for (const t of tasks) indeg.set(t.id, 0)
  const reverse = new Map() // dep -> dependents
  for (const t of tasks) {
    for (const d of deps.get(t.id)) {
      indeg.set(t.id, (indeg.get(t.id) || 0) + 1)
      if (!reverse.has(d)) reverse.set(d, [])
      reverse.get(d).push(t.id)
    }
  }
  const ready = tasks.filter(t => indeg.get(t.id) === 0).map(t => t.id).sort()
  const order = []
  while (ready.length) {
    const id = ready.shift()
    order.push(id)
    for (const dep of reverse.get(id) || []) {
      indeg.set(dep, indeg.get(dep) - 1)
      if (indeg.get(dep) === 0) ready.push(dep)
    }
    ready.sort()
  }
  if (order.length !== tasks.length) {
    const remaining = tasks.filter(t => !order.includes(t.id)).map(t => t.id)
    console.error('✗ ciclo detectado entre tasks: ' + remaining.join(', '))
    process.exit(1)
  }
  console.log('Ordem de execução das tasks (' + order.length + '):')
  order.forEach((id, i) => {
    const t = tasks.find(x => x.id === id)
    const depsOf = [...deps.get(id)].join(', ') || '-'
    console.log(`${String(i + 1).padStart(2)}. ${id}   [depende de: ${depsOf}]`)
  })
}

function cmdQuery(id) {
  const all = loadAllNodes()
  const node = all.find(n => n.id === id)
  if (!node) fail(`nó não encontrado: ${id}`)
  const out = []
  out.push(`## ${node.id}  (status: ${node.meta.status})`)
  if (node.meta.summary) out.push(`> ${node.meta.summary}`)
  out.push('')
  out.push(node.body.trim())
  const relates = node.meta.relates || []
  if (relates.length) {
    out.push('')
    out.push('### Relacionados (1 salto)')
    for (const ref of relates) {
      const r = all.find(n => n.id === ref)
      if (!r) { out.push(`- ${ref}  ⚠ ausente`); continue }
      out.push('')
      out.push(`#### ${r.id}  (status: ${r.meta.status})`)
      if (r.meta.summary) out.push(`> ${r.meta.summary}`)
      out.push(r.body.trim())
    }
  }
  console.log(out.join('\n'))
}

function cmdHelp() {
  console.log(`graphos ${VERSION} — motor do grafo de memória (spec-driven)

Uso: graphos <comando> [args] [--root <dir>]

Comandos:
  init                  cria a estrutura graphos/
  add <tipo> <slug>     cria um nó (${NODE_TYPES.join('|')})
  query <id>            imprime o subgrafo de 1 salto (contexto mínimo)
  validate              valida arestas, ids, status e drift
  order                 ordena as tasks por dependência (DAG)
  index                 reconstrói o index.json a partir de nodes/
`)
}

// ── main ────────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2)
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') return cmdHelp()
  if (args[0] === '--version' || args[0] === '-v') return console.log(VERSION)
  const cmd = args[0]
  switch (cmd) {
    case 'init': return cmdInit()
    case 'add': {
      const type = args[1], slug = args[2]
      const ti = args.indexOf('--title')
      const title = ti !== -1 && args[ti + 1] ? args[ti + 1] : undefined
      if (!type || !slug) return fail('uso: graphos add <tipo> <slug> [--title "Título"]')
      return cmdAdd(type, slug, title)
    }
    case 'query': return cmdQuery(args[1])
    case 'validate': return cmdValidate()
    case 'order': return cmdOrder()
    case 'index': return cmdIndex()
    default: return fail(`comando desconhecido: ${cmd}\nRode "graphos --help".`)
  }
}

main()
