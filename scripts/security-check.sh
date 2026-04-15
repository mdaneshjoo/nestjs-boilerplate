#!/usr/bin/env bash
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m'

fail() { echo -e "${RED}✗ $1${NC}" >&2; exit 1; }
pass() { echo -e "${GREEN}✓ $1${NC}"; }
info() { echo -e "${YELLOW}→ $1${NC}"; }

if UPSTREAM=$(git rev-parse --abbrev-ref --symbolic-full-name '@{u}' 2>/dev/null); then
  RANGE="$UPSTREAM..HEAD"
else
  RANGE="HEAD"
fi

# ── 1. No .env files committed (except .env.example) ──────────────────────
info "Checking for committed .env files..."
ENV_FILES=$(git ls-files | grep -E '(^|/)\.env(\..*)?$' | grep -vE '\.env\.example$' || true)
if [ -n "$ENV_FILES" ]; then
  fail ".env files are tracked:\n$ENV_FILES"
fi
pass "no .env files tracked"

# ── 2. Sensitive file block ───────────────────────────────────────────────
info "Checking for committed sensitive files..."
SENSITIVE=$(git ls-files | grep -iE '\.(pem|key|p12|pfx|keystore|jks|asc|gpg)$|(^|/)id_rsa(\..*)?$|(^|/)id_ed25519(\..*)?$' || true)
if [ -n "$SENSITIVE" ]; then
  fail "Sensitive files are tracked:\n$SENSITIVE"
fi
NPMRC_AUTH=$(git ls-files | xargs grep -lE '^//.+:_authToken=' 2>/dev/null || true)
if [ -n "$NPMRC_AUTH" ]; then
  fail "npm auth tokens found in:\n$NPMRC_AUTH"
fi
pass "no sensitive files tracked"

# ── 3. Secret regex scan on pushed commits ────────────────────────────────
info "Scanning pushed commits for secrets..."
PATTERNS=(
  'AKIA[0-9A-Z]{16}'
  'aws_secret_access_key[[:space:]]*=[[:space:]]*[A-Za-z0-9/+=]{40}'
  'BEGIN (RSA|DSA|EC|OPENSSH|PGP) PRIVATE KEY'
  'xox[baprs]-[0-9A-Za-z-]{10,48}'
  'ghp_[A-Za-z0-9]{36}'
  'github_pat_[A-Za-z0-9_]{82}'
  'glpat-[A-Za-z0-9_-]{20,}'
  'eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}'
  '(password|passwd|secret|api[_-]?key|token)[[:space:]]*[:=][[:space:]]*[A-Za-z0-9+/=_-]{16,}'
  'https://[A-Za-z0-9]+@[A-Za-z0-9.-]+\.ingest\.sentry\.io'
  'sk_live_[0-9a-zA-Z]{24,}'
  'sk_test_[0-9a-zA-Z]{24,}'
  'SG\.[A-Za-z0-9_-]{22}\.[A-Za-z0-9_-]{43}'
  'AIza[0-9A-Za-z_-]{35}'
)

DIFF=$(git diff "$RANGE" -- . ':(exclude)package-lock.json' ':(exclude)*.lock' ':(exclude).env.example' ':(exclude)*.env.example' 2>/dev/null || git diff HEAD -- . ':(exclude)package-lock.json' ':(exclude).env.example')
HITS=""
for p in "${PATTERNS[@]}"; do
  MATCH=$(echo "$DIFF" | grep -E "^\+" | grep -iE -- "$p" || true)
  if [ -n "$MATCH" ]; then
    HITS+="Pattern: $p\n$MATCH\n\n"
  fi
done
if [ -n "$HITS" ]; then
  fail "Possible secret(s) detected in pushed changes:\n$HITS"
fi
pass "no secrets detected"

# ── 4. gitleaks (binary → Docker fallback, required) ──────────────────────
info "Running gitleaks..."
run_gitleaks() {
  "$@" >/tmp/gitleaks.log 2>&1
  return $?
}
GL_MODE=""
GL_EXIT=0
if command -v gitleaks >/dev/null 2>&1; then
  GL_MODE="binary"
  run_gitleaks gitleaks detect --no-banner --redact --source . || GL_EXIT=$?
elif command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
  GL_MODE="docker"
  run_gitleaks docker run --rm -v "$(pwd):/path" zricethezav/gitleaks:latest \
    detect --no-banner --redact --source /path || GL_EXIT=$?
else
  fail "gitleaks required: install via \`brew install gitleaks\` (or scoop/choco/apt/go) OR start Docker Desktop/Engine"
fi
# gitleaks exit codes: 0 = clean, 1 = leaks found, other = runtime error
if [ "$GL_EXIT" -eq 0 ]; then
  pass "gitleaks clean ($GL_MODE)"
elif [ "$GL_EXIT" -eq 1 ]; then
  cat /tmp/gitleaks.log
  fail "gitleaks found leaked secrets"
else
  cat /tmp/gitleaks.log
  fail "gitleaks failed to run ($GL_MODE, exit=$GL_EXIT) — check network / Docker"
fi

# ── 5. Unsafe code patterns ───────────────────────────────────────────────
info "Scanning for unsafe code patterns..."
UNSAFE_PATTERNS=(
  '\beval[[:space:]]*\('
  'new[[:space:]]+Function[[:space:]]*\('
  'child_process[[:space:]]*\.[[:space:]]*exec[[:space:]]*\([^)]*\+[^)]*\)'
  'child_process[[:space:]]*\.[[:space:]]*execSync[[:space:]]*\([^)]*\+[^)]*\)'
  'dangerously''SetInnerHTML'
  'Math\.random\(\)[[:space:]]*.*(token|secret|password|key|id)'
)
UNSAFE_HITS=""
for p in "${UNSAFE_PATTERNS[@]}"; do
  FOUND=$(grep -rEn -- "$p" src/ 2>/dev/null || true)
  if [ -n "$FOUND" ]; then
    UNSAFE_HITS+="Pattern: $p\n$FOUND\n\n"
  fi
done
if [ -n "$UNSAFE_HITS" ]; then
  fail "Unsafe code patterns detected:\n$UNSAFE_HITS"
fi
pass "no unsafe code patterns"

# ── 6. Helmet applied ─────────────────────────────────────────────────────
info "Checking helmet is applied in main.ts..."
if ! grep -qE "app\.use\(helmet\(\)\)" src/main.ts; then
  fail "helmet() is not applied in src/main.ts"
fi
pass "helmet applied"

# ── 7. npm audit (high/critical, prod deps) ──────────────────────────────
info "Running npm audit (high, prod)..."
if ! npm audit --audit-level=high --omit=dev >/tmp/npm-audit.log 2>&1; then
  cat /tmp/npm-audit.log
  fail "npm audit found high/critical vulnerabilities"
fi
pass "no high/critical vulnerabilities"

# ── 8. License compliance (block GPL/AGPL/SSPL/BUSL in prod) ─────────────
info "Checking prod dependency licenses..."
LIC_BAD=$(npx --no-install license-checker --production --json 2>/dev/null \
  | node -e "let j=JSON.parse(require('fs').readFileSync(0,'utf8'));let bad=[];for(const [k,v] of Object.entries(j)){const l=Array.isArray(v.licenses)?v.licenses.join(','):String(v.licenses||'');if(/(^|[^A-Z])(AGPL|GPL-|SSPL|BUSL)/i.test(l))bad.push(k+' → '+l)}console.log(bad.join('\n'))")
if [ -n "$LIC_BAD" ]; then
  echo "$LIC_BAD"
  fail "banned license in prod deps"
fi
pass "no banned licenses"

# ── 9. SAST via eslint-plugin-security + general lint ────────────────────
info "Running SAST + lint..."
if ! npx eslint "src/**/*.ts" --max-warnings=0; then
  fail "Security/lint failed"
fi
pass "security + lint clean"

# ── 10. TypeScript type-check ────────────────────────────────────────────
info "Running TypeScript type-check..."
if ! npx tsc --noEmit; then
  fail "TypeScript type-check failed"
fi
pass "type-check clean"

# ── 11. Build ─────────────────────────────────────────────────────────────
info "Running nest build..."
if ! npx nest build; then
  fail "nest build failed"
fi
pass "build successful"

echo -e "\n${GREEN}All security checks passed.${NC}"
