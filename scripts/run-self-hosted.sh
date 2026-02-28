#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUNNER_BIN="${FUNEE_RUNNER_BIN:-funee}"
SUT_BIN="${FUNEE_SUT_BIN:-${REPO_ROOT}/target/sut/funee}"

if [[ ! -x "${SUT_BIN}" ]]; then
  echo "SUT binary not found at ${SUT_BIN}"
  echo "Run ./scripts/prepare-sut.sh first or set FUNEE_SUT_BIN."
  exit 1
fi

echo "Runner binary: ${RUNNER_BIN}"
echo "SUT binary: ${SUT_BIN}"

# Self-hosted tests refer to ./target/sut/funee from repo root.
cd "${REPO_ROOT}"

"${RUNNER_BIN}" --version || true
"${SUT_BIN}" --version || true

"${RUNNER_BIN}" tests/self-hosted/basic.ts
"${RUNNER_BIN}" tests/self-hosted/stdlib.ts
"${RUNNER_BIN}" tests/self-hosted/http.ts
"${RUNNER_BIN}" tests/self-hosted/misc.ts
