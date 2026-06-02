# Retry And Backoff

## Intent

Handle transient failures with controlled retries and delay strategy to improve reliability.

## How It Is Implemented In This Repository

- Service Bus message publishing includes retry logic with delay growth.
- Queue configuration constrains redelivery behavior.

## Key Evidence

- module/quest5Tier/func/serviceBus/function.js
- module/quest5Tier/func/deploy/localDev/serviceBus/queue.json
- Documentation/SideEffectIdempotency.md

## Trade-Offs

- Increases resilience during transient outages.
- Must be paired with idempotency to prevent repeated side effects.

## Related Modules

- quest5Tier
- quest5TierEg
