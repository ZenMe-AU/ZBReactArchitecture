# Candidate And Planned Patterns

These patterns are tracked as candidates because code-level evidence is currently weak, absent, or incomplete.

Current filter note: only Wikipedia-aligned entries are actionable for standalone authoring in this pass. See [MissingPatternsPlan.md](MissingPatternsPlan.md).

## Outbox Pattern

Status: Candidate
Reason: No dedicated outbox storage and relay flow has been identified.
Next validation: verify persistence + publish transaction boundaries in command processing modules.
Gate: Deferred by Wikipedia alignment gate.

## Saga Or Compensation

Status: Candidate
Reason: No orchestration state machine or compensating transaction implementation has been identified.
Next validation: inspect long-running business workflows for explicit compensation handlers.
Pattern standard: [saga-or-compensation.md](saga-or-compensation.md)
Gate: Eligible for standalone pattern authoring.

## Circuit Breaker

Status: Candidate
Reason: No explicit breaker policy implementation has been identified.
Next validation: check HTTP or message client wrappers for open/half-open/closed behavior.
Pattern standard: [circuit-breaker.md](circuit-breaker.md)
Gate: Eligible for standalone pattern authoring.

## Feature Flags

Status: Candidate
Reason: No feature flag provider or runtime toggling framework has been identified.
Next validation: verify config-driven toggles across UI/API modules.
Pattern standard: [feature-flags.md](feature-flags.md)
Gate: Eligible for standalone pattern authoring.

## Backend For Frontend

Status: Candidate
Reason: No dedicated UI-specific backend boundary is currently evident.
Next validation: confirm whether module APIs are shared by multiple consumers or tailored per frontend.
Gate: Deferred by Wikipedia alignment gate.

## Hexagonal Or Clean Architecture

Status: Candidate
Reason: Layering exists, but explicit ports/adapters boundaries are not consistently modeled.
Next validation: inspect dependency direction and adapter contracts per module.
Pattern standard: [hexagonal-or-clean-architecture.md](hexagonal-or-clean-architecture.md)
Gate: Eligible for standalone pattern authoring.

## Anti-Corruption Layer

Status: Candidate
Reason: No explicit translation boundary between distinct domain models/systems has been identified.
Next validation: inspect integration points for dedicated mapping/isolation components.
Gate: Deferred by Wikipedia alignment gate.

## Feature RBAC And Entitlement Routing

Status: Candidate
Reason: Authentication is in place, but feature-level entitlement controls are not enforced consistently across shell routes, navigation, and backend operations.
Next validation: confirm role-to-feature policy design and implement end-to-end authorization checks.
Pattern standard: [composite-FeatureRbacAndEntitlementRouting.md](composite-FeatureRbacAndEntitlementRouting.md)
Gate: Deferred by Wikipedia alignment gate.

## Runtime Remote Frontend Modules

Status: Candidate
Reason: Frontend modules are currently composed at build-time, without runtime remote loading and independent release boundaries.
Next validation: evaluate remote module loading strategy, compatibility policy, and rollout mechanics.
Pattern standard: [composite-RuntimeRemoteFrontendModules.md](composite-RuntimeRemoteFrontendModules.md)
Gate: Deferred by Wikipedia alignment gate.
