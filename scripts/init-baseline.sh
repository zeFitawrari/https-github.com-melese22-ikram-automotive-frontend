#!/usr/bin/env bash
# scripts/init-baseline.sh
# Generate baseline of Next.js build warnings for gate.sh comparison.
set -e
export NODE_ENV=production
LOG=$(mktemp)

echo "Running next build (timeout 600s, non-interactive)..."

if ! CI=true timeout 600 npm run build --silent > "$LOG" 2>&1 </dev/null; then
  echo "⚠️  Build failed or timed out (600s)."
  echo "   Diagnose with: npm run build   (run directly, no redirect)"
  echo "   Creating empty baseline so gate.sh can still run."
  : > scripts/.gate-baseline.txt
  rm -f "$LOG"
  exit 0
fi

sed 's/\x1b\[[0-9;]*m//g' "$LOG" | grep -iE '(⚠|warn)' | sort -u > scripts/.gate-baseline.txt || true
COUNT=$(wc -l < scripts/.gate-baseline.txt)
echo "Wrote $COUNT baseline warnings to scripts/.gate-baseline.txt"
rm -f "$LOG"
