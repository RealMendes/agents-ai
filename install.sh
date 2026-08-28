#!/usr/bin/env sh
# Instalador do Graphos: instala o engine como comando global e opcionalmente prepara um projeto.
# Uso:
#   sh install.sh                 instala o comando `graphos`
#   sh install.sh /caminho/proj   também prepara um projeto
set -eu

REPO="$(cd "$(dirname "$0")" && pwd)"
HOME_DIR="${GRAPHOS_HOME:-$HOME/.graphos}"
BIN="$HOME_DIR/bin"
PROJECT="${1:-}"

mkdir -p "$HOME_DIR" "$BIN"
cp "$REPO/engine/graphos.mjs" "$HOME_DIR/graphos.mjs"

cat > "$BIN/graphos" <<'EOF'
#!/usr/bin/env sh
exec node "$(dirname "$0")/../graphos.mjs" "$@"
EOF
chmod +x "$BIN/graphos"

echo "Engine instalado em $HOME_DIR"
echo "Adicione ao PATH (uma vez) e reinicie o terminal:"
echo "  export PATH=\"\$PATH:$BIN\""

if [ -n "$PROJECT" ]; then
  mkdir -p "$PROJECT/.claude"
  cp -R "$REPO/graphos" "$PROJECT/graphos"
  cp "$REPO/CLAUDE.md" "$PROJECT/CLAUDE.md"
  for d in agents skills commands; do
    [ -d "$REPO/$d" ] && cp -R "$REPO/$d" "$PROJECT/.claude/$d"
  done
  echo "Projeto preparado em $PROJECT"
fi
