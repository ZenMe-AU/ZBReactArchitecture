# CQRS (Command Query Responsibility Segregation)

## Overview

quest3Tier applies CQRS as a lightweight logical separation between write operations (commands) and read operations (queries) across its API routes, handlers, and service functions. This keeps the module aligned to CQRS intent without requiring a separate read/write data store topology.

The pattern addresses a concrete module risk: quest3Tier mixes CRUD-style endpoints with explicit command endpoints, so read/write concerns can drift without explicit boundaries. CQRS in this module is implemented as contract-level separation, where query paths are read-only and command paths own state transitions.

The main trade-off is operational simplicity versus strict physical separation. quest3Tier keeps one persistence model, so correctness depends on handler and service contracts rather than independent read/write infrastructure. Full event sourcing is therefore optional here, while command and event tracking can still be applied where it adds value.

Wikipedia Reference:

- Command Query Responsibility Segregation: https://en.wikipedia.org/wiki/Command_Query_Responsibility_Segregation

## Implementation

### Specialization: Simple CQRS in quest3Tier

quest3Tier implements a lightweight CQRS specialization where the HTTP surface, handler layer, and service layer are logically separated into command and query operations.

Command-side routes (state changes):

- [CreateQuestion](func/route.mjs#L13)
- [UpdateQuestionById](func/route.mjs#L27)
- [PatchQuestionById](func/route.mjs#L34)
- [AddAnswer](func/route.mjs#L41)
- [SendFollowUpCmd](func/route.mjs#L83)
- [ShareQuestionCmd](func/route.mjs#L92)

Query-side routes (state reads):

- [GetQuestionById](func/route.mjs#L20)
- [GetQuestionListByUser](func/route.mjs#L55)
- [GetAnswerListByQuestionId](func/route.mjs#L62)
- [GetSharedQuestionListByUser](func/route.mjs#L76)
- [getEventByCorrelationId](func/route.mjs#L101)

Handler-level separation mirrors this split:

Command handlers:

- [CreateQuestion](func/handler/handler.mjs#L58)
- [UpdateQuestionById](func/handler/handler.mjs#L119)
- [PatchQuestionById](func/handler/handler.mjs#L595)
- [AddAnswer](func/handler/handler.mjs#L212)
- [SendFollowUpCmd](func/handler/handler.mjs#L821)
- [ShareQuestionCmd](func/handler/handler.mjs#L839)

Query handlers:

- [GetQuestionById](func/handler/handler.mjs#L156)
- [GetQuestionListByUser](func/handler/handler.mjs#L320)
- [GetAnswerListByQuestionId](func/handler/handler.mjs#L392)
- [GetSharedQuestionListByUser](func/handler/handler.mjs#L527)
- [GetEventByCorrelationId](func/handler/handler.mjs#L815)

Service-layer evidence also follows command/query responsibilities:

Command services:

- [create](func/service/function.mjs#L24)
- [updateById](func/service/function.mjs#L38)
- [addAnswerByQuestionId](func/service/function.mjs#L103)
- [patchById](func/service/function.mjs#L382)
- [insertFollowUpCmd](func/service/function.mjs#L208)
- [updateFollowUpCmdStatus](func/service/function.mjs#L268)
- [insertQuestionShareCmd](func/service/function.mjs#L277)
- [updateQuestionShareCmdStatus](func/service/function.mjs#L291)
- [shareQuestion](func/service/function.mjs#L169)

Query services:

- [getById](func/service/function.mjs#L59)
- [getCombinationListByUser](func/service/function.mjs#L78)
- [getAnswerListByQuestionId](func/service/function.mjs#L127)
- [getSharedQuestionListByUser](func/service/function.mjs#L365)
- [getEventByCorrelationId](func/service/function.mjs#L391)

Frontend API usage reflects the same split:

Query API functions:

- [getQuestionsByUser](ui/api/question.ts#L10)
- [getQuestionById](ui/api/question.ts#L62)
- [getAnswerListByQuestionId](ui/api/question.ts#L175)
- [getSharedQuestionList](ui/api/question.ts#L195)

Command API functions:

- [createQuestion](ui/api/question.ts#L34)
- [updateQuestion](ui/api/question.ts#L83)
- [updateQuestionPatch](ui/api/question.ts#L222)
- [submitAnswer](ui/api/question.ts#L142)
- [shareQuestion](ui/api/question.ts#L109)
- [sendFollowUpQuestion](ui/api/question.ts#L254)

Current module contracts used to keep CQRS simple:

- Command contract: command handlers return acknowledgement metadata (for example identifiers or success status) rather than query projections.
- Query contract: query handlers do not perform domain state mutation.
- Storage contract: read and write paths may share the same persistence model in quest3Tier.
- Event sourcing contract: optional for this module; command/event tables may exist without full event-sourced aggregates.

## Future enhancements

- Adopt stricter naming conventions to make command and query endpoints immediately distinguishable.
- Add tests that explicitly verify query handlers are side-effect free and command handlers only return acknowledgement metadata.
- Introduce read-specific DTO shaping to prevent accidental coupling to write models.
- If read scale or projection complexity increases, split read and write repositories while preserving the current API boundary.
- Decide whether the direct share write endpoint should be retained alongside command endpoints or consolidated into command-only flows.

## Related Decisions and Patterns

Related patterns:

- [CQRS canonical pattern](../../Documentation/ArchitecturePatterns/CQRS.md)
- [Basic 3-Tier Structure](../../Documentation/ArchitecturePatterns/Basic3TierStructure.md)
- [Event Sourcing](../../Documentation/ArchitecturePatterns/EventSourcing.md)
- [Idempotent Command Processing](../../Documentation/ArchitecturePatterns/idempotent-command-processing.md)
- [Composite: Idempotent Command Processing](../../Documentation/ArchitecturePatterns/composite-IdempotentCommandProcessing.md)
- [Composite: Observability and Correlation](../../Documentation/ArchitecturePatterns/composite-ObservabilityAndCorrelation.md)

Related guidance:

- [Architecture pattern documentation rules](../../Documentation/ArchitecturePatterns/AGENTS.md)

Related decisions:

- No quest3Tier-specific CQRS decision record is currently documented.
- [Decisions index](../../Documentation/Decisions/README.md)
