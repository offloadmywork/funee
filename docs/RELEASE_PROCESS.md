# Release Process

## Goal

Use a stable, published `funee` binary as the self-hosted test runner, while testing a freshly built local binary as the system under test (SUT).

## Runner vs SUT

- Runner: installed release binary (`funee` from GitHub Releases)
- SUT: local build copied to `./target/sut/funee`

Commands:

```bash
./scripts/prepare-sut.sh
./scripts/run-self-hosted.sh
```

Optional explicit binaries:

```bash
FUNEE_RUNNER_BIN=/usr/local/bin/funee \
FUNEE_SUT_BIN=$PWD/target/sut/funee \
./scripts/run-self-hosted.sh
```

## Publishing

`/.github/workflows/release.yml` publishes archives when pushing tags that match `v*`.

Example:

```bash
git tag v0.1.0
git push origin v0.1.0
```

Each release archive includes:

- `bin/funee`
- `funee-lib/`

## Homebrew

Start with GitHub Releases first. Add Homebrew after release artifacts are stable and checksums are part of the process.
