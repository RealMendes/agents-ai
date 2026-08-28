# Protocolo Graphos

Este é o contrato canônico do grafo de memória. Todo membro do time SDD segue
estas regras ao ler e escrever.

## 1. O grafo é feito de arquivos

- Cada **nó** é um arquivo Markdown em `graphos/nodes/<tipo>/<slug>.md`.
- O **índice** `graphos/index.json` é a fonte única de adjacência e status.
- A relação entre nós (as arestas) vive em `relates` no front-matter do nó **e**
  replicada no índice.

## 2. Esquema de um nó

Front-matter YAML obrigatório em todo nó. `tags` e `relates` são sempre arrays
**inline** (`[a, b]`) — é o formato que o engine lê:

```yaml
---
id: spec/auth-login
type: spec
status: draft
tags: [auth, security]
relates: [decision/auth-jwt, task/add-login-endpoint]
summary: "Login por JWT com refresh token."
---
```

O corpo é Markdown livre. Mantenha-o **compacto** (meta: ≤ ~300 palavras).

## 3. Tipos de nó e seus status

| tipo      | significado                              | status válidos                                  |
|-----------|------------------------------------------|-------------------------------------------------|
| `spec`    | especificação (objetivo, requisitos, aceite) | draft, review, approved, implemented, done    |
| `decision`| decisão de arquitetura/design (ADR)      | proposed, accepted, superseded                  |
| `task`    | unidade de implementação                 | todo, in-progress, done, blocked                |
| `module`  | módulo/arquivo/componente de código      | stub, stable, deprecated                        |
| `learning`| insight, gotcha, lição, achado de review | active, resolved                                |
| `test`    | plano/resultado de teste                 | planned, passing, failing                       |

## 4. Semântica das arestas (implícita por tipo)

| origem       | destino     | significado                              |
|--------------|-------------|------------------------------------------|
| `spec`       | `task`      | a spec se desdobra na tarefa (implements) |
| `spec`       | `decision`  | a spec é informada pela decisão           |
| `spec`       | `test`      | a spec é verificada pelo teste            |
| `task`       | `module`    | a tarefa modifica o módulo                |
| `task`       | `spec`      | a tarefa implementa a spec                |
| `decision`   | `module`    | a decisão afeta o módulo                  |
| `module`     | `module`    | dependência entre módulos                 |
| `task`/`decision`/`test` | `learning` | produz um aprendizado/achado              |

## 5. Regras de otimização de tokens (obrigatórias)

1. **Entre pelo índice, nunca varrendo a árvore.** Consulte `index.json` e use
   `grep` para localizar o nó certo antes de abrir arquivos.
2. **Leia 1 salto.** Abra o nó alvo e somente os nós listados em `relates`.
   Avance para 2 saltos apenas se a tarefa exigir.
3. **Não despeje o grafo inteiro.** Nunca leia todo `nodes/` nem serialize o
   índice inteiro para o modelo se não precisar.
4. **Reuse antes de rederivar.** Antes de projetar ou decidir, procure
   `decision` e `learning` existentes sobre o assunto.
5. **Grave resumos, não transcrições.** Corpo do nó compacto; o que importa é
   a informação necessária para o próximo passo, não o histórico.
6. **Mantenha o índice em dia.** Toda criação/edição de nó atualiza
   `index.json` (id, file, status, tags, relates, summary).

## 6. Convenções de id e slug

- `id` = `<tipo>/<slug>`, ex.: `spec/auth-login`, `task/add-login-endpoint`.
- `slug` em kebab-case, curto e descritivo.
- `file` = `nodes/<tipo>/<slug>.md`.

## 7. Engine (linha de comando)

`node engine/graphos.mjs <comando>` (ou `graphos`, se instalado no PATH):

- `init` — cria a estrutura `graphos/` (nodes, templates, index.json).
- `add <tipo> <slug>` — cria um nó e registra no índice.
- `query <id>` — imprime o subgrafo de 1 salto (contexto mínimo p/ prompt).
- `validate` — valida arestas, ids, status e drift.
- `order` — ordena as tasks por dependência (DAG / topological sort).
- `index` — reconstrói o `index.json` a partir de `nodes/`.
