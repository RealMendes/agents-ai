---
name: graphos-engine
description: Use when you need to query, create, validate, or order the Graphos graph memory — the spec-driven knowledge graph in graphos/.
---

# Graphos Engine

O Graphos guarda a memória do projeto como um grafo de arquivos: nós em
`graphos/nodes/<tipo>/<slug>.md` + índice `graphos/index.json`. Esquema completo
em `graphos/PROTOCOL.md`.

## Como rodar o engine

Tente, em ordem:

1. `graphos <comando>` (se instalado no PATH).
2. `node "$CLAUDE_PLUGIN_ROOT/engine/graphos.mjs" <comando>` (instalado como plugin).
3. `node engine/graphos.mjs <comando>` (repo clonado no projeto).

## Comandos

- `graphos init` — cria a estrutura `graphos/`.
- `graphos add <tipo> <slug> [--title "Título"]` — cria um nó.
- `graphos query <id>` — imprime o subgrafo de 1 salto (contexto mínimo; cole no prompt).
- `graphos validate` — valida arestas, ids, status e drift.
- `graphos order` — ordem de execução das tasks (DAG / topological sort).
- `graphos index` — reconstrói o `index.json`.

## Regras (otimização de tokens)

- Entre pelo índice (`index.json` + `grep`); nunca varra a árvore.
- Leia 1 salto (`query <id>`). Nunca despeje o grafo inteiro.
- Grave de volta resumos compactos e rode `graphos index` depois de editar.
