---
name: sdd-workflow
description: Spec-driven development pipeline — use when starting any non-trivial coding task to specify before coding, then design, implement, review, and test.
---

# SDD Workflow

Não comece a codar sem uma spec. Siga as fases:

1. **Especificar** (subagent `specifier`) → spec decision-complete antes de código.
2. **Projetar** (subagent `architect`) → decisions, modules, tasks.
3. **Implementar** (subagent `implementer`) → uma task por vez.
4. **Revisar** (subagent `reviewer`) → achados + tasks de correção.
5. **Testar** (subagent `qa`) → critérios de aceite com evidência.
6. **Integrar** → consolidar e decidir entregar/iterar.

Delegue cada fase ao subagent correspondente (`agents/`), passando um prompt
autossuficiente com o `id` do(s) nó(s) relevante(s). Use o engine
(`graphos query/validate/order`) para montar o contexto mínimo e manter o grafo
consistente. Fluxo completo: `graphos/SDD-PIPELINE.md`.
