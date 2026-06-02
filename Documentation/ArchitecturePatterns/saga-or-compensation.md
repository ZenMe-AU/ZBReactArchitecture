# Saga Or Compensation

## Overview

### Intent

Coordinate long-running distributed workflows using compensating actions rather than global transactions.

### Problem

Cross-service operations can partially succeed. Without orchestration or compensation, failures can leave system state inconsistent across modules and message-driven steps.

### Trade-Offs

- Improves consistency for long-running distributed business flows.
- Requires explicit compensation contracts and workflow-state tracking.
- Increases testing complexity across happy-path and compensation-path scenarios.

### Wikipedia Reference

- Long-running transaction (saga interaction pattern): https://en.wikipedia.org/wiki/Long-running_transaction

## Implementation

### Current Repository State

Asynchronous queue-based processing is present, but no explicit saga state machine or compensation workflow standard is currently documented as implemented.

### Evidence

- [Documentation/ArchitecturePatterns/CandidatePatterns.md](CandidatePatterns.md)
- [Documentation/ArchitecturePatterns/composite-Partial5TierAsync.md](composite-Partial5TierAsync.md)
- [module/quest5Tier/func/serviceBus/function.js](../../module/quest5Tier/func/serviceBus/function.js)

## Future enhancements

- Define saga boundaries and coordinator ownership for cross-module workflows.
- Introduce compensating actions for each non-atomic business step.
- Persist workflow state transitions to support retries, recovery, and auditability.

## Related Decisions and Patterns

### Related Decisions

- [Documentation/Decisions/README.md](../Decisions/README.md)

### Related Patterns

- [EventDrivenArchitecture.md](EventDrivenArchitecture.md)
- [CQRS.md](CQRS.md)
- [EventSourcing.md](EventSourcing.md)
- [idempotent-command-processing.md](idempotent-command-processing.md)
