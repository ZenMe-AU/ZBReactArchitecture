# QuestionData Azure Table repository

Azure Table Storage repository layer for quest3Tier, replacing
`repository/model/Question.mjs`, `QuestionLog.mjs`, `QuestionAction.mjs`,
`QuestionAnswer.mjs` and `Profile.mjs` one endpoint at a time. Nothing in
`repository/model/` has been removed yet -- this folder is additive until
every quest3Tier endpoint has been migrated (see "Migration status" below).

Written in TypeScript (`.mts`) per the existing convention in
[handler/questionGetById.mts](../../handler/questionGetById.mts): `.mts` is
the source, `npx tsc` compiles it to the sibling `.mjs` + `.d.mts` that
actually ships (`.funcignore` excludes `*.ts` from the deploy package, so
Azure Functions only ever runs the compiled `.mjs`).

## Data model

One table, `QuestionData`, partitioned by `questionId` so a question, its
audit trail, and its answers can be written atomically in a single Table
batch transaction (same PartitionKey, same table -- Azure Table's only
transaction scope).

| PartitionKey | RowKey | Holds |
|---|---|---|
| `questionId` | `question` | the question row |
| `questionId` | `answer:{profileId}:{createdAt}:{answerId}` | one answer; RowKey order groups+sorts answers by profile so "latest per profile" is a single range scan |
| `questionId` | `event:{eventId}` | audit trail row (`eventKind: "log"` for field changes, `"action"` for a raw JSON Patch) |

Profiles get their own two tables since Azure Table has no secondary index:

| Table | PartitionKey | RowKey |
|---|---|---|
| `Profiles` | `internalProfileId` | `profile` |
| `ProfileByExternalId` | `externalId` | `profile` |

`ensureProfile` claims an `externalId` via an insert-only `createEntity` on
`ProfileByExternalId` (fails with 409 if it already exists), which is also
what makes concurrent first-calls for the same external id safe.

## Migration status

Migrated to this layer: nothing yet wired into handlers -- this is the
repository layer only, not yet called from `route.mjs`.

Deliberately **not** designed/migrated yet:
- `GetQuestionListByUser` / share / follow-up endpoints -- depend on
  `QuestionShare` data that hasn't moved to Table Storage yet. Migrating the
  list endpoint first would silently drop "shared with me" questions.
- A Service Bus outbox row (`outbox:{eventId}`) -- there is no actual
  `@azure/service-bus` publish call anywhere in quest3Tier's handler/service
  code today, only the dependency and deploy scaffolding reference it.
  Nothing to replace yet.
- `Coordinates` -- belongs to the separate `coordinate` module, not
  quest3Tier.

Sequelize/`pg`/the migration folder stay until every endpoint above is
migrated and compared against its Postgres baseline; deleting them is the
last step.

## How to run this locally

1. Start Azurite's table service (the Functions host already expects
   `AzureWebJobsStorage=UseDevelopmentStorage=true` in
   [local.settings.json](../../local.settings.json), so no new env var is
   needed):

   ```bash
   node node_modules/azurite/dist/src/azurite.js \
     --location /tmp/azurite-quest3tier \
     --tableHost 127.0.0.1 --tablePort 10002
   ```
   (run from the workspace root, where `azurite` is installed)

2. After editing any `.mts` file in this folder, recompile it (manual step,
   same as the existing `questionGetById.mts` convention -- there is no
   watch/build script yet):

   ```bash
   npx tsc -p module/quest3Tier/func/tsconfig.json
   ```

3. Run the contract tests:

   ```bash
   cd module/quest3Tier/func
   pnpm run test:table
   ```

The tests in [../../vitest/tableQuestion.test.mjs](../../vitest/tableQuestion.test.mjs)
mirror the CRUD/hook coverage in
[../../vitest/dbTest.test.mjs](../../vitest/dbTest.test.mjs) so the two
stores can be compared endpoint by endpoint while both exist.
