# Time de desenvolvimento SDD + Graphos

Este workspace contém um **time de subagents para desenvolvimento de código**
que trabalha em modo spec-driven (SDD) usando o **Graphos** — um grafo de
memória em arquivos para memória inteligente e otimização de tokens.

## O que há aqui

- `graphos/` — o grafo de memória (esquema, índice, templates, papéis, pipeline).
  Comece por `graphos/README.md` e `graphos/PROTOCOL.md`.
- `presets/` — cópia versionável dos 6 presets (um diretório por papel, com
  `agent.cordis.yml` + `preset.yml`).
- `scripts/` — instalador dos presets em outro harness.
- **6 presets persistentes** (em `~/.dsh/.agent-presets/`), um por papel:

| Preset | Papel |
|--------|-------|
| `sdd-specifier`   | Especificador — escreve a spec antes de qualquer código |
| `sdd-architect`   | Arquiteto — decisões, módulos e tarefas |
| `sdd-implementer` | Implementador — escreve o código seguindo a spec |
| `sdd-reviewer`    | Revisor — revisa contra a spec e as decisões |
| `sdd-qa`          | QA — verifica critérios de aceite com evidência |
| `sdd-integrator`  | Integrador — orquestra o pipeline e cuida do grafo |

## Como começar

1. **Orquestrar um trabalho**: inicie uma sessão com o preset `SDD Integrador`
   e descreva o objetivo. Ele delega às fases usando os briefings em
   `graphos/roles/`.
2. **Trabalhar em um papel específico**: inicie uma sessão com o preset do
   papel correspondente.
3. A memória (specs, decisões, tarefas, aprendizados) fica em `graphos/`, então
   qualquer papel retoma o contexto lendo só o que precisa.

## Exportar e instalar em outro harness

O projeto é portável em duas camadas:

- **Metodologia + memória** (`graphos/`, `roles/`, `templates/`, `SDD-PIPELINE.md`):
  puro Markdown/JSON — funciona em qualquer harness/agente. Basta copiar o
  diretório `graphos/` para o workspace do destino.
- **Presets** (`presets/`): são composições Cordis que dependem dos pacotes do
  preset `standard` de um deployment DSH. Para instalar em outro harness DSH:

```powershell
# Windows (PowerShell)
./scripts/install-presets.ps1
```

```sh
# macOS / Linux
sh scripts/install-presets.sh
```

Isso copia cada preset para `$DSH_HOME/.agent-presets/`. Reinicie o harness e os
6 presets aparecem no seletor. Se o destino for uma versão mais antiga e algum
pacote faltar, a validação de montagem aponta qual.

## Claude Code

Adaptação para Claude Code: o **Integrador** vira o agente principal via
`CLAUDE.md`, e os 5 papéis restantes viram subagents em `.claude/agents/`. O
`graphos/` funciona igual. Rode `claude` na raiz do projeto e descreva o
objetivo — o agente orquestra as fases usando os subagents.
