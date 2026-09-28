# Q3 Azure Table repositories

Q3 uses four Azure tables:

| Table | Purpose |
|---|---|
| `Profiles` | Profiles keyed by internal profile ID |
| `ProfileByExternalId` | External-to-internal profile ID lookup |
| `QuestionData` | Questions, answers, shares, logs, and actions |
| `WorkflowData` | Follow-up and share commands, filters, and events |

`QuestionData` is partitioned by question ID so related writes can use Azure
Table transactions. `WorkflowData` is partitioned by correlation ID.

Local clients use the `AzureWebJobsStorage` Azurite connection string. Azure
clients use `AzureWebJobsStorage__tableServiceUri` and the Function App's
managed identity.

Run `pnpm run build`, `pnpm run test:profile`, and `pnpm run test:table` from
`module/quest3Tier/func` after changing a repository.
