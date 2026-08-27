# Time SDD + Graphos (Claude Code)

Time de desenvolvimento **spec-driven** para o **Claude Code**, com memória
inteligente em grafo (**Graphos**) para otimizar tokens.

## Como usar

1. Rode `claude` na raiz do projeto.
2. Descreva o objetivo. O agente principal (`CLAUDE.md`, papel de Integrador)
   orquestra as fases delegando aos subagents de `.claude/agents/`.
3. A memória fica em `graphos/`: cada papel lê só o nó relevante e grava de volta
   resumos compactos.

## Papéis (subagents)

| Subagent | Papel |
|----------|-------|
| `specifier`   | Especificador — spec antes de qualquer código |
| `architect`   | Arquiteto — decisões, módulos e tarefas |
| `implementer` | Implementador — código seguindo a spec |
| `reviewer`    | Revisor — revisa contra spec/decisões |
| `qa`          | QA — verifica critérios de aceite |
| agente principal (`CLAUDE.md`) | Integrador — orquestra e cuida do grafo |

## Memória (Graphos)

- `graphos/PROTOCOL.md` — esquema do grafo + regras de otimização de tokens.
- `graphos/index.json` — índice único de adjacência/status.
- `graphos/templates/` — templates de nó.
- `graphos/nodes/` — os nós (specs, decisões, tarefas, módulos, aprendizados, testes).
- `graphos/SDD-PIPELINE.md` — o fluxo de fases.
