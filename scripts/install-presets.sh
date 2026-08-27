#!/usr/bin/env sh
# Instala os presets SDD em um harness DSH copiando presets/* para $DSH_HOME/.agent-presets/.
set -eu

DSH_HOME="${DSH_HOME:-$HOME/.dsh}"
SRC="$(cd "$(dirname "$0")/../presets" && pwd)"
DST="$DSH_HOME/.agent-presets"

[ -d "$SRC" ] || { echo "Diretório presets não encontrado: $SRC" >&2; exit 1; }
mkdir -p "$DST"

for d in "$SRC"/*/; do
  name="$(basename "$d")"
  cp -R "$d" "$DST/$name"
  echo "instalado: $name"
done
echo "Concluído. Reinicie o harness para listar os novos presets."
