# Q3 Function App

Q3 stores profiles, questions, answers, shares, and workflow events in Azure
Table Storage. Local development uses Azurite through
`AzureWebJobsStorage=UseDevelopmentStorage=true`; Azure uses the Function
App's managed identity.

## Local development

1. Install dependencies from the repository root: `pnpm install`.
2. Start Azurite with its table service on port `10002`.
3. Start this Function App with `pnpm run start`.
4. Run the API suite with `pnpm run test:vitest`.

The API suite contains 139 tests. Repository-only checks are available through
`pnpm run test:profile` and `pnpm run test:table`.

TypeScript sources compile to `dist/`; generated `.mjs` and declaration files
must not be committed beside `.mts` sources.
