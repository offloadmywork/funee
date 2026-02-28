#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SUT_DIR="${REPO_ROOT}/target/sut"
SUT_BIN="${SUT_DIR}/funee"

echo "Building SUT from current source..."
cargo build --release --manifest-path "${REPO_ROOT}/Cargo.toml"

mkdir -p "${SUT_DIR}"
cp "${REPO_ROOT}/target/release/funee" "${SUT_BIN}"
chmod +x "${SUT_BIN}"

echo "SUT prepared at ${SUT_BIN}"
"${SUT_BIN}" --version || true
