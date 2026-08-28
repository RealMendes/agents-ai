# Time SDD + Graphos (Claude Code)

Time de desenvolvimento **spec-driven** para o Claude Code, com **memória em
grafo (Graphos)** e um **engine de linha de comando** que valida o grafo, monta o
contexto mínimo e ordena as tarefas por dependência.

## Instalar como plugin (igual ao Superpowers)

No Claude Code:

```
/plugin install https://github.com/RealMendes/agents-ai
```

Ou registre o marketplace e instale:

```
/plugin marketplace add RealMendes/graphos-sdd-marketplace
/plugin install graphos-sdd@graphos-sdd-marketplace
```

## Instalar standalone (ter o comando `graphos`)

```
# Windows
./install.ps1                          # só o comando graphos
./install.ps1 -Project C:\caminho      # + prepara um projeto

# macOS / Linux
sh install.sh                          # só o comando graphos
sh install.sh /caminho/projeto         # + prepara um projeto
```

## Como usar

1. Rode `claude` na raiz do projeto (ou use o comando `/sdd`).
2. Descreva o objetivo. O agente principal (`CLAUDE.md`, Integrador) orquestra as
   fases delegando aos subagents.
3. O engine mantém o grafo: `graphos add`, `query`, `validate`, `order`, `index`.

## Papéis (subagents)

| Subagent | Papel |
|----------|-------|
| `specifier`   | Especificador — spec antes de qualquer código |
| `architect`   | Arquiteto — decisões, módulos e tarefas |
| `implementer` | Implementador — código seguindo a spec |
| `reviewer`    | Revisor — revisa contra spec/decisões |
| `qa`          | QA — verifica critérios de aceite |
| agente principal (`CLAUDE.md`) | Integrador — orquestra e cuida do grafo |

## Estrutura

- `engine/graphos.mjs` — o motor (init/add/query/validate/order/index).
- `graphos/` — a memória (PROTOCOL, index.json, templates, nodes).
- `agents/`, `skills/`, `commands/` — o time como plugin.
- `.claude-plugin/` — manifestos do plugin e marketplace.
