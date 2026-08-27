# Pipeline SDD (spec-driven development)

Fluxo do time. Cada fase produz nós no Graphos e alimenta a próxima. O agente
principal (Integrador, via `CLAUDE.md`) orquestra; as demais fases rodam como
subagents definidos em `.claude/agents/`.

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

### 6. Integrar — agente principal (`CLAUDE.md`)
Consolida, mantém o `index.json` consistente e decide concluir ou iterar.

## Como o Integrador orquestra

Delegue cada fase ao subagent correspondente (`.claude/agents/`), passando um
prompt autossuficiente com o `id` do(s) nó(s) relevante(s). Ordem típica:

1. `specifier` (o pedido do usuário) → aprovar a spec.
2. `architect` (id da spec) → revisar decisões e tarefas.
3. para cada task `todo`: `implementer` (id da task).
4. `reviewer` (ids tocados).
5. `qa` (id da spec).
6. consolidar no `index.json` e relatar ao humano.

Para tasks independentes, rode vários subagents em paralelo e colete os
resultados antes de seguir para a próxima fase.
