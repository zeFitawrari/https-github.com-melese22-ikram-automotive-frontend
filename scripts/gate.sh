#!/usr/bin/env bash
# scripts/gate.sh <finding_id>
set -eo pipefail

ID=${1:?Usage: scripts/gate.sh <finding_id>}

echo "=================================================="
echo "RUNNING DETERMINISTIC GATE FOR FINDING #$ID"
echo "=================================================="

# 1. SCOPE CHECK
echo "==> [1/4] Scope check..."
ALLOWED_PREFIXES=("app/" "components/" "lib/" "public/" "tests/audit/" "docs/audit/" ".github/" "next.config.js" "tailwind.config.js" "package.json" "package-lock.json")
CHANGED=$( { git diff --name-only HEAD; git ls-files --others --exclude-standard; } | sort -u )
for file in $CHANGED; do
  IN_SCOPE=false
  for prefix in "${ALLOWED_PREFIXES[@]}"; do
    if [[ "$file" == "$prefix"* ]] || [[ "$file" == "$prefix" ]]; then
      IN_SCOPE=true
      break
    fi
  done
  if [ "$IN_SCOPE" = false ]; then
    echo "❌ GATE FAILURE: Modified file out of scope: $file"
    exit 2
  fi
done
echo "✓ Scope check passed."

# 2. STRICT TYPESCRIPT COMPILATION
echo "==> [2/4] Strict TypeScript compilation..."
if [ -x node_modules/.bin/tsc ]; then
  TS_CMD="./node_modules/.bin/tsc --noEmit"
else
  echo "❌ GATE FAILURE: tsc not found in node_modules — run 'npm install'"
  exit 3
fi
if ! $TS_CMD </dev/null; then
  echo "❌ GATE FAILURE: TypeScript compilation failed!"
  exit 3
fi
echo "✓ TypeScript passed."

# 3. NEXT.JS PRODUCTION BUILD & WARNING BASELINE
echo "==> [3/4] Next.js production build..."
export NODE_ENV=production
BUILD_LOG=$(mktemp)
WARN_NOW=$(mktemp)
BASELINE="scripts/.gate-baseline.txt"

[ -f "$BASELINE" ] || touch "$BASELINE"

if ! CI=true timeout 600 npm run build --silent > "$BUILD_LOG" 2>&1 </dev/null; then
  echo "❌ GATE FAILURE: Next.js build failed or timed out (600s)!"
  tail -40 "$BUILD_LOG"
  rm -f "$BUILD_LOG" "$WARN_NOW"
  exit 4
fi

sed 's/\x1b\[[0-9;]*m//g' "$BUILD_LOG" | grep -iE '(⚠|warn)' | LC_ALL=C sort -u > "$WARN_NOW" || true
NEW_WARNS=$(comm -13 <(LC_ALL=C sort "$BASELINE") "$WARN_NOW" || true)
if [ -n "$NEW_WARNS" ]; then
  echo "❌ GATE FAILURE: New build warnings introduced:"
  echo "$NEW_WARNS"
  rm -f "$BUILD_LOG" "$WARN_NOW"
  exit 5
fi
rm -f "$BUILD_LOG" "$WARN_NOW"
echo "✓ Next.js production build passed with no new warnings."

# 4. EXECUTABLE REPRODUCTION TEST
echo "==> [4/4] Executing reproduction test..."
REPRO="tests/audit/repro-$ID.sh"
if [ ! -f "$REPRO" ]; then
  echo "❌ GATE FAILURE: Reproduction script $REPRO was not created by the agent!"
  exit 6
fi

chmod +x "$REPRO"
if ! bash "$REPRO" </dev/null; then
  echo "❌ GATE FAILURE: Reproduction script $REPRO returned non-zero! Bug is still present."
  exit 7
fi
echo "✓ Reproduction script passed (exit code 0)."

echo "=================================================="
echo "✅ GATE PASSED FOR FINDING #$ID"
echo "=================================================="
exit 0
