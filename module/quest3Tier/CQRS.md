# CQRS

## Overview

### Intent

Define CQRS in quest3Tier as a minimal, practical separation between write operations and read operations:

- Commands represent intent to change state.
- Queries retrieve state and do not perform business state changes.
- The separation is logical at API, handler, and service levels; separate databases are optional.

This keeps quest3Tier simple while still aligning with the CQRS definition.

### Problem

quest3Tier combines classic CRUD-style endpoints with explicit command endpoints. Without a clear boundary, write paths can leak query concerns, query paths can gain hidden state changes, and the module becomes harder to test and evolve.

### Trade-Offs

- A lightweight CQRS split improves clarity and testability without introducing unnecessary infrastructure.
- Because read and write paths still share persistence models in this module, strict separation relies on handler and service contracts.
- Full event sourcing is not required for this module, but command/event tracking can still be used where useful.

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

Related decisions:

- [Decisions index](../../Documentation/Decisions/README.md)
