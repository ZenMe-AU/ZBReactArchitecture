# Candidate And Planned Patterns

These patterns are tracked as candidates because code-level evidence is currently weak, absent, or incomplete.

## Outbox Pattern

Status: Candidate
Reason: No dedicated outbox storage and relay flow has been identified.
Next validation: verify persistence + publish transaction boundaries in command processing modules.

## Saga Or Compensation

Status: Candidate
Reason: No orchestration state machine or compensating transaction implementation has been identified.
Next validation: inspect long-running business workflows for explicit compensation handlers.

## Circuit Breaker

Status: Candidate
Reason: No explicit breaker policy implementation has been identified.
Next validation: check HTTP or message client wrappers for open/half-open/closed behavior.

## Feature Flags

Status: Candidate
Reason: No feature flag provider or runtime toggling framework has been identified.
Next validation: verify config-driven toggles across UI/API modules.

## Backend For Frontend

Status: Candidate
Reason: No dedicated UI-specific backend boundary is currently evident.
Next validation: confirm whether module APIs are shared by multiple consumers or tailored per frontend.

## Hexagonal Or Clean Architecture

Status: Candidate
Reason: Layering exists, but explicit ports/adapters boundaries are not consistently modeled.
Next validation: inspect dependency direction and adapter contracts per module.

## Anti-Corruption Layer

Status: Candidate
Reason: No explicit translation boundary between distinct domain models/systems has been identified.
Next validation: inspect integration points for dedicated mapping/isolation components.
