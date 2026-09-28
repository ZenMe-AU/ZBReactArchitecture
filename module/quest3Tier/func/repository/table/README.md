# Q3 Azure Table repositories

Q3 uses five Azure tables:

| Table | Purpose |
|---|---|
| `Profiles` | Profiles keyed by internal profile ID |
| `ProfileByExternalId` | External-to-internal profile ID lookup |
| `QuestionData` | Questions, answers, and shares |
| `WorkflowData` | Follow-up filters |
| `UserEvents` | Question logs and actions plus follow-up and question-share commands/events aggregated per user |

`QuestionData` uses `PartitionKey = profileId` and record-prefixed RowKeys
such as `question:<questionId>` and `answer:<questionId>:<answerId>`.
`WorkflowData` retains follow-up filters. `UserEvents` uses
`PartitionKey = profileId` and `RowKey = events`.

Local clients use the `AzureWebJobsStorage` Azurite connection string. Azure
clients use `AzureWebJobsStorage__tableServiceUri` and the Function App's
managed identity.

Run `pnpm run build`, `pnpm run test:profile`, and `pnpm run test:table` from
`module/quest3Tier/func` after changing a repository.
