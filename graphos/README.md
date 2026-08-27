# Graphos — grafo de memória para desenvolvimento spec-driven

Graphos é a camada de **memória inteligente** do time de desenvolvimento SDD
(spec-driven development). Ele guarda tudo que o time sabe — specs, decisões,
tarefas, módulos, aprendizados e resultados de teste — como um **grafo em
arquivos**, dentro do diretório de trabalho.

O objetivo central é **otimização de tokens**: cada agente lê apenas o que
precisa (um nó e seus vizinhos diretos), nunca o projeto inteiro, e grava de
volta resumos compactos em vez de históricos completos.

## Layout

```
graphos/
  README.md           este arquivo
  PROTOCOL.md         esquema do grafo + regras de leitura/escrita (referência canônica)
  index.json          índice do grafo: id → status/tags/relates (fonte única de adjacência)
  nodes/
    spec/             nós de especificação
    decision/         nós de decisão de arquitetura/design
    task/             nós de tarefa de implementação
    module/           nós de módulo/arquivo/componente
    learning/         nós de aprendizado/insight
    test/             nós de plano/resultado de teste
  templates/          templates prontos para cada tipo de nó
  SDD-PIPELINE.md     o fluxo completo e como orquestrar
```

## Como usar (rápido)

1. **Antes de trabalhar**, consulte `index.json` e use `grep` para achar o nó
   certo. Leia só aquele nó e os ids listados em `relates` (1 salto).
2. **Trabalhe** seguindo a spec e as decisões relevantes.
3. **Depois**, grave de volta: crie/atualize o nó do seu tipo e atualize
   `index.json` (status, tags, relates, summary). Resuma, não transcreva.

O fluxo de fases (Especificar → Projetar → Implementar → Revisar → Testar →
Integrar) está em `SDD-PIPELINE.md`.
