# Self-Hosted Runtime Spec

This document defines the runtime spec using self-hosted tests as the source of truth.

The spec is exercised by scenarios in:

- `/tests/self-hosted/basic.ts`
- `/tests/self-hosted/misc.ts`
- `/tests/self-hosted/http.ts`
- `/tests/self-hosted/stdlib.ts`

For macro runtime behavior, the normative requirements below are anchored in
`/tests/self-hosted/misc.ts` and macro fixtures under `/tests/fixtures/macro`.

## Macro Runtime Requirements

1. `SPEC-MACRO-RUNTIME-001`
- Requirement: `Closure()` MUST normalize plain-object references into a `Map`.
- Scenario: `macro :: [SPEC-MACRO-RUNTIME-001] ...`

2. `SPEC-MACRO-RUNTIME-002`
- Requirement: `Closure()` MUST preserve `Map` references as `Map`.
- Scenario: `macro :: [SPEC-MACRO-RUNTIME-002] ...`

3. `SPEC-MACRO-RUNTIME-003`
- Requirement: Canonical reference records MUST expose `uri` and `name`.
- Scenario: `macro :: [SPEC-MACRO-RUNTIME-003] ...`

4. `SPEC-MACRO-RUNTIME-004`
- Requirement: `Definition()` MUST produce `declaration` and `references`.
- Scenario: `macro :: [SPEC-MACRO-RUNTIME-004] ...`

5. `SPEC-MACRO-EXPANSION-001`
- Requirement: `createMacro`-marked closures MUST expand at bundle time.
- Scenario: `macro :: [SPEC-MACRO-EXPANSION-001] ...`
- Fixture: `/tests/fixtures/macro/closure-macro.ts`

6. `SPEC-MACRO-REFERENCES-001`
- Requirement: Cross-file identifiers used in captured closures MUST be tracked in references.
- Scenario: `macro :: [SPEC-MACRO-REFERENCES-001] ...`
- Fixture: `/tests/fixtures/macro/cross-file-ref/entry.ts`

7. `SPEC-MACRO-EXEC-001`
- Requirement: Macro execution MUST support conditional branching based on captured expression shape.
- Scenario: `macro :: [SPEC-MACRO-EXEC-001] ...`
- Fixture: `/tests/fixtures/macro/conditional_macro.ts`

8. `SPEC-MACRO-EXEC-002`
- Requirement: Macro execution MUST expose `arg.expression` for compile-time introspection.
- Scenario: `macro :: [SPEC-MACRO-EXEC-002] ...`
- Fixture: `/tests/fixtures/macro/introspection_macro.ts`

9. `SPEC-MACRO-EXEC-003`
- Requirement: Macro execution MUST pass multiple closure arguments in order.
- Scenario: `macro :: [SPEC-MACRO-EXEC-003] ...`
- Fixture: `/tests/fixtures/macro/multi_arg_compare.ts`

10. `SPEC-MACRO-EXEC-004`
- Requirement: Variadic macro signatures MUST receive all captured arguments.
- Scenario: `macro :: [SPEC-MACRO-EXEC-004] ...`
- Fixture: `/tests/fixtures/macro/variadic_numeric_count.ts`

11. `SPEC-MACRO-REFERENCES-002`
- Requirement: Macro execution MUST expose `arg.references` for compile-time inspection.
- Scenario: `macro :: [SPEC-MACRO-REFERENCES-002] ...`
- Fixture: `/tests/fixtures/macro/references_introspection.ts`

12. `SPEC-MACRO-EXEC-005`
- Requirement: Macro output MUST support object/array/member-expression code generation.
- Scenario: `macro :: [SPEC-MACRO-EXEC-005] ...`
- Fixture: `/tests/fixtures/macro/object_array_member_macro.ts`

13. `SPEC-MACRO-EXEC-006`
- Requirement: Macro output MUST support sequence-expression style emitted code.
- Scenario: `macro :: [SPEC-MACRO-EXEC-006] ...`
- Fixture: `/tests/fixtures/macro/debug_sequence_macro.ts`

## CLI Conformance Backstops

Integration-level conformance remains covered in `/tests/cli.test.ts`:

- Macro detection and expansion flow
- Macro-added references
- Recursive expansion
- Infinite recursion guard
- Emitted output does not retain macro definitions

Self-hosted scenarios are normative; CLI tests are regression backstops.
