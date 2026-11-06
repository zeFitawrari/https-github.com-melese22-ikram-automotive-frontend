# Autonomous Audit-Fix Workflow

You are fixing exactly ONE finding from `docs/audit/tracker.md`. You must follow these phases in order. Never skip a step.

## Rules
1. `git status` must be clean. If uncommitted changes exist, STOP.
2. Work on branch `audit-fixes` (or `fix/<ID>`). Never touch `main`.
3. Never read, print, or edit `.env*`. Never modify files outside this repository.

---

## Phase 1 — VERIFY & AUTOMATE THE REPRODUCTION
1. **Run Raw STEP 0 First**: Execute the exact command from `STEP 0 — REPRODUCE` in your terminal.
   - If the raw command does NOT demonstrate the bug, STOP and report `STEP0_AMBIGUOUS`.
2. **Create Executable Repro**: Create `tests/audit/repro-<ID>.sh` using that reproduction logic.
   - Script MUST exit with code `1` if the bug is PRESENT.
   - Script MUST exit with code `0` if the bug is FIXED.
3. **Execute Script**: Run `bash tests/audit/repro-<ID>.sh`.
   - It MUST exit `1`.
   - If it exits `0` on unmodified code: Re-run the raw STEP 0. If raw STEP 0 shows the bug is present, your script is weak—rewrite it. Only if raw STEP 0 also fails to show the bug may you report `ALREADY_FIXED`.
   - Record the failure output as before-fix evidence.

---

## Phase 2 — FIX
1. Make the smallest possible change that removes the root cause as specified in `STEP 1 — FIX`.
2. Stay strictly within the files listed in the finding's `FILE(S)` field.

---

## Phase 3 — VERIFY VIA GATE
1. Re-run `bash tests/audit/repro-<ID>.sh`. It must now pass (exit `0`).
2. Run `bash scripts/gate.sh <ID>`. It will verify:
   - Scope check (no unapproved files changed)
   - Strict TypeScript compilation (`npx tsc --noEmit`)
   - Next.js production build (`npx next build`)
   - The reproduction script exit code (`tests/audit/repro-<ID>.sh` exits 0)
3. If anything fails, diagnose the real issue and adjust (max 3 attempts). If still failing, revert changes (`git restore .`) and report `BLOCKED`.

---

## Phase 4 — REPORT & COMMIT
1. Stage the changed application files and the repro script:
   `git add <file1> <file2> tests/audit/repro-<ID>.sh`
2. Commit the fix:
   `git commit -m "fix(<ID>): <one-line summary>"`
3. Get the real commit hash:
   `HASH=$(git rev-parse HEAD)`
4. Append an audit report to `docs/audit/REPORTS.md` using the standard format.
5. Stage the report and amend the commit:
   `git add docs/audit/REPORTS.md && git commit --amend --no-edit`
6. Post a short summary to chat: Status, commit hash, decisions made.
