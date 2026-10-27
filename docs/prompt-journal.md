# Prompt Journal

## 1. Plan-first

**Prompt:** “Before editing, inspect the existing SupportDesk project and make a
small implementation plan for the ticket CSV CLI. Identify the files, input
validation rules, and how the build and tests should be verified. Preserve
unrelated work.”

**Critique:** Planning made the package scripts, compiler configuration,
ticket conversion, CLI, tests, and documentation explicit. The plan was checked
against the existing branch and worktree before changes were made.

**Outcome:** Changes were limited to the requested CLI deliverables, with
compilation and tests reserved for validation after implementation.

## 2. Clarifying questions

**Prompt:** “List any ambiguous requirements for a CSV-to-JSON ticket CLI.
Prefer safe defaults for optional details, and ask only about decisions that
would materially change the output or user workflow.”

**Critique:** The requested headers and sequential ticket IDs are specified;
quoted CSV fields are supported so realistic descriptions can contain commas.
No material ambiguity required blocking implementation.

**Outcome:** The CLI accepts a CSV path, requires `title`, `description`, and
`priority`, and reports invalid input with a non-zero exit status.

## 3. Test-first

**Prompt:** “Define Jest cases for ticket ID formatting and uniqueness, valid
CSV conversion, empty input, missing columns, malformed rows, empty required
fields, quoted values, and non-string input before implementing the parser.”

**Critique:** Assertions cover both successful output shape and actionable
validation failures. Tests also cover ID uniqueness across multiple converted
rows rather than only testing the formatter in isolation.

**Outcome:** The regression suite checks the required behaviors and the CSV
parser edge cases.

## 4. Structured debugging

**Prompt:** “When a build or test fails, capture the exact error, trace it to
the responsible source or configuration, make the smallest root-cause fix,
then rerun the failing check and the full requested validation commands.”

**Critique:** Separating configuration, compilation, CLI behavior, and test
failures avoids hiding errors behind broad workarounds. The final validation
must use the requested build and Jest commands.

**Outcome:** Validation is performed with `npm.cmd run build` and
`npm.cmd test -- --runInBand`; the CLI is also exercised with the included
eight-ticket CSV sample.
