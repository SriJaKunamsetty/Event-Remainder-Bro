# Rules for AI coding agents working in this repository

Read this before changing code. These rules are enforced by `npm run check`.

## Architecture

- `src/domain/` is pure TypeScript: no React, no Next.js, no network, no clock, no randomness.
  Anything time-dependent takes `today` as a parameter.
- Dependencies point inward: UI and API routes call services, services call the domain.
  The domain never imports from `app/`, `ai/` or `services/`.
- The language model sits behind a port (interface). Business rules never import a vendor SDK.
- The model writes ideas only. Budgets, dates and checklists are always computed in code.

## Style

- TypeScript `strict`, no `any`, no non-null assertions without a comment explaining why.
- Files stay under 200 lines and functions under 60 (ESLint enforces both).
- Name things for their domain meaning (`allocateBudget`, not `process`).
- Comments explain why, never what. If a comment describes what the code does, refactor.
- Money is an integer in minor units. Dates are `YYYY-MM-DD` and handled in whole UTC days.

## Security

- Parse every external input with Zod (`strictObject`, explicit upper bounds) at the boundary.
- Treat model output as untrusted: validate against a schema and render it as plain text.
- Never use `dangerouslySetInnerHTML`. Never log user free text. Secrets live only in env vars.
- Server-only values must never use the `NEXT_PUBLIC_` prefix.

## Process

- Every new module ships with tests in the same change (`*.test.ts` beside the file).
- Prefer asserting on returned state over asserting on calls to mocks. Use fakes, not mocks.
- Keep commits small, on `main`, with conventional messages (`feat:`, `fix:`, `test:`, `docs:`).
- Before finishing, run `npm run check && npm run build`.
- Only claim in the README what a test, command or file in this repo demonstrates.
