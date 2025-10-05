
# Event Sourcing Side Effects
In event sourcing, the system records all changes as a sequence of immutable events. These events reconstruct the current state of an aggregate. However, some operations—like sending emails, updating external services, or triggering downstream processes—are side effects. They are not part of the aggregate’s state but are triggered by events.

# Causes of Side Effect Duplication
## Event Replay Without Deduplication
When rebuilding state or regenerating read models, replaying events can inadvertently re-trigger side effects—such as sending notifications or updating external systems—unless deduplication mechanisms are in place. This is especially problematic if the system crashes mid-side-effect and reprocesses the same event upon restart

## Recursive Event Flows
A poorly designed event flow where one event triggers another, which in turn triggers the original event, can lead to infinite loops or repeated side effects. A real-world example involved a UserUpdated event triggering a ProfileUpdated, which then triggered another UserUpdated, causing an out-of-memory crash. [Event Sour...ite Metric]

## Schema Evolution Without Upcasters
When event schemas change (e.g., adding a new field), older projections may misinterpret new data during replay. This can lead to side effects being triggered based on outdated or misaligned logic, such as applying a 2024 discount to a 2022 order

## Improper Event Design
Events that lack domain meaning or use command-like naming (e.g., send-email instead of email-sent) blur the line between intent and outcome. This ambiguity can cause systems to treat events as instructions rather than records of completed actions, leading to repeated execution.

## Concurrency Violations
If side effects are triggered before the event is successfully persisted, and the persistence fails, the side effect cannot be rolled back. This leads to duplication when the system retries the operation. [Event Sour...k Overflow]

## Missing Causation or Correlation IDs
Without tracking the lineage of events, systems cannot determine whether a side effect has already been processed. This is especially important in distributed systems where events may arrive out of order or be retried.

# Ways to protect against duplicate side effects
## Idempotency
Track Processed Events: Store a record of events that have already triggered a specific side effect. When a duplicate event arrives, check this log; if the event was processed, the side effect is skipped. 
Version with Revision IDs: Use optimistic locking and revision IDs (or version numbers) to ensure that only one update occurs for a given event, even if it is processed multiple times. 
Use Unique Identifiers: For commands that trigger side effects, include a unique ID and check if that ID has already been processed before executing the side effect. 

## Smart Event Handlers
Design event handlers to be aware of the context—whether they are processing live events or replayed ones. Use metadata or configuration flags to control whether side effects should be triggered.
When replaying events to rebuild projections or read models, replace the side-effecting components with "noop" (no operation) versions. This prevents side effects from being retriggered during historical event processing


# Implementation Guide
## Replay Events Only
For this solution, only commands are allowed to trigger side effects, not events. 
When events are replayed, they will not cause any duplication of side effects.
Commands do not get replayed, only events can be replayed.

## Handle duplicate Commands
Commands can be duplicated under some circumstances related to distributed systems.
Before a command is executed, it is checked that the command hasn't been previously received and executed.

