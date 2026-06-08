# CQRS

## Overview

### Intent

Define CQRS in quest5TierEg as a full specialization where command intake, command processing, and query retrieval are explicitly separated:

- Commands are accepted through command APIs and processed asynchronously.
- Queries are served through dedicated query APIs and query handlers.
- Event publication and event consumption are part of the command lifecycle.

This specialization demonstrates a stricter CQRS implementation than quest3Tier while staying aligned to the canonical CQRS pattern.

### Problem

When write operations and read retrieval are handled in the same synchronous flow, complex features such as patch updates, follow-up fan-out, and shared workflows become harder to scale and reason about. quest5TierEg addresses this by separating command acceptance from command execution and keeping query responsibilities independent.

### Trade-Offs

- Stronger separation improves clarity, asynchronous scalability, and traceability of command processing.
- The architecture is more complex than simple logical CQRS because it introduces event publication, queue/event handlers, and additional operational concerns.
- Eventual consistency must be managed explicitly because queries can observe state after asynchronous command completion.

Wikipedia Reference:

- Command Query Responsibility Segregation: https://en.wikipedia.org/wiki/Command_Query_Responsibility_Segregation

## Implementation

### Specialization: Full CQRS with asynchronous command processing in quest5TierEg

quest5TierEg separates query and command surfaces at metadata and route registration level.

Metadata-level query and command declarations:

- Query definitions and routes: [funcMetaData queries](func/funcMetaData.js#L138)
- Command definitions and routes: [funcMetaData commands](func/funcMetaData.js#L147)
- Query classes: [GetQuestion](func/funcMetaData.js#L13), [GetAnswer](func/funcMetaData.js#L21), [GetQuestionList](func/funcMetaData.js#L29), [GetAnswerList](func/funcMetaData.js#L37), [GetSharedQuestionList](func/funcMetaData.js#L45), [GetQuestionShareEventList](func/funcMetaData.js#L53), [GetFollowUpEventList](func/funcMetaData.js#L63)
- Command classes: [CreateQuestionCmd](func/funcMetaData.js#L73), [UpdateQuestionCmd](func/funcMetaData.js#L85), [CreateAnswerCmd](func/funcMetaData.js#L97), [SendFollowUpCmd](func/funcMetaData.js#L109), [ShareQuestionCmd](func/funcMetaData.js#L123)

Route wiring in Azure Functions follows the same separation:

- HTTP query and command registration: [func/route.js](func/route.js#L11)
- Event Grid command-processing handlers: [func/route.js](func/route.js#L95)

Handler-level specialization is explicit:

Command API handlers (accept command intent and publish messages/events):

- [CreateQuestion](func/handler/apiCmdHandler.js#L73)
- [UpdateQuestion](func/handler/apiCmdHandler.js#L153)
- [CreateAnswer](func/handler/apiCmdHandler.js#L251)
- [SendFollowUp](func/handler/apiCmdHandler.js#L353)
- [ShareQuestion](func/handler/apiCmdHandler.js#L436)

Query API handlers (read-only retrieval):

- [GetQuestionById](func/handler/apiQryHandler.js#L40)
- [GetAnswerById](func/handler/apiQryHandler.js#L77)
- [GetQuestionListByUser](func/handler/apiQryHandler.js#L133)
- [GetAnswerListByQuestionId](func/handler/apiQryHandler.js#L200)
- [GetSharedQuestionListByUser](func/handler/apiQryHandler.js#L266)
- [GetEventByCorrelationId](func/handler/apiQryHandler.js#L272)

Asynchronous command execution is handled independently by queue/event handlers:

- [CreateQuestion event handler](func/handler/queueCmdHandler.js#L12)
- [UpdateQuestion event handler](func/handler/queueCmdHandler.js#L22)
- [CreateAnswer event handler](func/handler/queueCmdHandler.js#L33)
- [SendFollowUp event handler](func/handler/queueCmdHandler.js#L44)
- [ShareQuestion event handler](func/handler/queueCmdHandler.js#L55)

Frontend API calls mirror the split and reinforce intent:

Query API functions:

- [getQuestionsByUser](ui/api/question.ts#L10)
- [getQuestionById](ui/api/question.ts#L62)
- [getAnswerListByQuestionId](ui/api/question.ts#L176)
- [getSharedQuestionList](ui/api/question.ts#L196)

Command API functions:

- [createQuestion](ui/api/question.ts#L34)
- [updateQuestion](ui/api/question.ts#L83)
- [updateQuestionPatch](ui/api/question.ts#L223)
- [submitAnswer](ui/api/question.ts#L142)
- [shareQuestion](ui/api/question.ts#L109)
- [sendFollowUpQuestion](ui/api/question.ts#L255)

Current module contracts used in this specialization:

- Command contract: HTTP command handlers acknowledge receipt and return command/message tracking metadata.
- Processing contract: command mutation work is executed by asynchronous event handlers.
- Query contract: query handlers serve retrieval concerns without performing command-side mutation.
- Consistency contract: query results may lag command acceptance until asynchronous handlers complete.

## Future enhancements

- Standardize command acknowledgement payload shape across all command APIs.
- Add explicit status endpoints for in-flight command processing and failure diagnostics.
- Expand idempotency guarantees for command replay and duplicate delivery scenarios.
- Add stronger projection/read-model documentation once dedicated read models diverge from write entities.
- Add module-level tests that verify command/query boundary rules and asynchronous completion expectations.

## Related Decisions and Patterns

Related patterns:

- [CQRS canonical pattern](../../Documentation/ArchitecturePatterns/CQRS.md)
- [Event Sourcing](../../Documentation/ArchitecturePatterns/EventSourcing.md)
- [Idempotent Command Processing](../../Documentation/ArchitecturePatterns/idempotent-command-processing.md)
- [Composite: Idempotent Command Processing](../../Documentation/ArchitecturePatterns/composite-IdempotentCommandProcessing.md)
- [Composite: Observability and Correlation](../../Documentation/ArchitecturePatterns/composite-ObservabilityAndCorrelation.md)

Related decisions:

- [Decisions index](../../Documentation/Decisions/README.md)
