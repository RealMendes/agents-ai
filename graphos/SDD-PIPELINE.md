# Pipeline SDD (spec-driven development)

Fluxo do time. Cada fase produz nós no Graphos e alimenta a próxima. O
Integrador orquestra; as demais fases podem rodar como subagents (use os
briefings em `graphos/roles/`).

```
Pedido ─▶ 1. Especificar ─▶ 2. Projetar ─▶ 3. Implementar ─▶ 4. Revisar ─▶ 5. Testar ─▶ 6. Integrar ─▶ (itera ou entrega)
```

## Fases

### 1. Especificar — `specifier`
Transforma o pedido em uma spec decision-complete **antes de qualquer código**.
- Entregável: `nodes/spec/<slug>.md` (objetivo, escopo, fora-de-escopo,
  requisitos, critérios de aceite) + entrada no `index.json`.
- Não escreve código, não decide arquitetura.

### 2. Projetar — `architect`
A partir de uma spec aprovada, decide o design.
- Entregáveis: `nodes/decision/*.md`, `nodes/module/*.md`, `nodes/task/*.md`
  (tarefas com critérios de conclusão) + `index.json`.
- Não implementa código.

### 3. Implementar — `implementer`
Implementa uma tarefa por vez, lendo apenas a spec/decision/module relevantes.
- Entregáveis: código + `nodes/module/*` atualizado + `nodes/learning/*` +
  tarefa marcada `done` no `index.json`.
- Divergência da spec vira `learning` + pedido de `decision`, não improviso.

### 4. Revisar — `reviewer`
Revisa o código contra a spec e as decisões.
- Entregáveis: `nodes/learning/*` (achados) + `nodes/task/*` de correção.
- Não altera código na revisão.

### 5. Testar — `qa`
Verifica os critérios de aceite com evidência.
- Entregáveis: `nodes/test/*` (plano + resultado por critério) + tarefas de
  correção se falhar.

### 6. Integrar — `integrator`
Consolida, mantém o `index.json` consistente e decide concluir ou iterar.

## Como o Integrador orquestra

Delegue cada fase com o briefing correspondente. Exemplo (chamadas `subagent`,
uma por vez, com `run_in_background: false` quando a próxima fase depende do
resultado):

1. `subagent(prompt=ler graphos/roles/specifier.md + o pedido do usuário)`
2. aprovar a spec, depois `subagent(prompt=ler graphos/roles/architect.md + id da spec)`
3. para cada tarefa `todo`, `subagent(prompt=ler graphos/roles/implementer.md + id da task)`
4. `subagent(prompt=ler graphos/roles/reviewer.md + ids tocados)`
5. `subagent(prompt=ler graphos/roles/qa.md + id da spec)`
6. consolidar no `index.json` e relatar ao humano.

Para muitas tarefas independentes, use a ferramenta `workflow` com um estágio
por fase (spec → design → implement → review → test), passando o conteúdo do
briefing como prompt de cada `agent()`.
