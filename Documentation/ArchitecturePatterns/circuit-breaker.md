# Circuit Breaker

## Overview

### Intent

Prevent repeated calls to an unhealthy dependency by opening a failure gate and recovering gradually.

### Problem

Retry alone can amplify outages when downstream systems are unavailable. Without a circuit breaker, repeated attempts continue to consume resources and increase latency across call paths.

### Trade-Offs

- Reduces cascading failure risk for unstable dependencies.
- Requires careful threshold tuning and observability to avoid false opens.
- Introduces state-management complexity (closed/open/half-open).

### Wikipedia Reference

- Circuit breaker design pattern: https://en.wikipedia.org/wiki/Circuit_breaker_design_pattern

## Implementation

### Current Repository State

No explicit circuit-breaker policy implementation has been identified in the current codebase. Existing resilience behavior is primarily retry-based in messaging flows.

### Evidence

- [Documentation/ArchitecturePatterns/CandidatePatterns.md](CandidatePatterns.md)
- [Documentation/ArchitecturePatterns/RetryAndBackoff.md](RetryAndBackoff.md)
- [module/quest5Tier/func/serviceBus/function.js](../../module/quest5Tier/func/serviceBus/function.js)

## Future enhancements

- Introduce circuit-breaker wrappers for outbound HTTP and messaging dependencies.
- Emit breaker state transitions into telemetry for alerting and diagnostics.
- Define per-dependency thresholds and recovery strategy (including half-open probe behavior).

## Related Decisions and Patterns

### Related Decisions

- [Documentation/Decisions/README.md](../Decisions/README.md)

### Related Patterns

- [RetryAndBackoff.md](RetryAndBackoff.md)
- [idempotent-command-processing.md](idempotent-command-processing.md)
- [EventDrivenArchitecture.md](EventDrivenArchitecture.md)
