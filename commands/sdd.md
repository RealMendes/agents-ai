---
description: Run the spec-driven development pipeline (specify → design → implement → review → test)
---

Disparar o pipeline SDD: especificar → projetar → implementar → revisar → testar
→ integrar. Siga `graphos/SDD-PIPELINE.md`, delegue cada fase aos subagents em
`agents/` e use o engine (`graphos query/validate/order`) para montar o contexto
mínimo e manter o grafo consistente.

Se o usuário forneceu um objetivo ($ARGUMENTS), comece pela fase Especificar
com esse objetivo. Caso contrário, pergunte o objetivo antes de prosseguir.
