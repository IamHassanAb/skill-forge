#!/usr/bin/env bash
input=$(cat)

# Parse each field on its own line to avoid space-splitting issues
parsed=$(python3 -c "
import sys, json
data = json.load(sys.stdin)

model = data.get('model', {}).get('display_name', 'unknown')

cwd = (
    data.get('cwd') or
    data.get('workspace', {}).get('current_dir') or
    data.get('session', {}).get('cwd') or
    'unknown'
)

used = data.get('session', {}).get('contextUsagePercent', 0)

print(model)
print(cwd)
print(used)
" <<< "$input")

model=$(sed -n '1p' <<< "$parsed")
cwd=$(sed -n '2p' <<< "$parsed")
used=$(sed -n '3p' <<< "$parsed")

# Fallback: use shell's own working directory if cwd is still unknown/empty
if [ -z "$cwd" ] || [ "$cwd" = "unknown" ]; then
  cwd="$PWD"
fi

# ── Git branch ────────────────────────────────────────────────────────────────
branch=""
if git -C "$cwd" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  branch=$(git -C "$cwd" --no-optional-locks symbolic-ref --short HEAD 2>/dev/null)
fi

# ── Colors ────────────────────────────────────────────────────────────────────
GREEN="\033[32m"
DIM="\033[2m"
RESET="\033[0m"
SEP="${DIM} | ${RESET}"

# ── Context bar (10 chars wide) ───────────────────────────────────────────────
build_bar() {
  local pct=${1:-0}
  local filled=$(( pct * 10 / 100 ))
  local empty=$(( 10 - filled ))
  local bar=""
  for (( i=0; i<filled; i++ )); do bar+="█"; done
  for (( i=0; i<empty;  i++ )); do bar+="░"; done
  printf "%s" "$bar"
}

pct=$(printf '%.0f' "${used:-0}")
bar=$(build_bar "$pct")

# ── Assemble ──────────────────────────────────────────────────────────────────
output="${GREEN}${model}${RESET}"
output+="${SEP}${GREEN}$(basename "$cwd")${RESET}"

if [ -n "$branch" ]; then
  output+="${SEP}${GREEN}${branch}${RESET}"
fi

output+="${SEP}${GREEN}[${bar}]${RESET} ${pct}%"

printf "%b\n" "$output"