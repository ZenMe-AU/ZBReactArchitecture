# Architecture Pattern Index

This folder contains architecture pattern documentation for the repository.

Scope rules for this index:

- Implemented patterns are code-first and must have concrete repository evidence.
- Candidate patterns are tracked separately when implementation evidence is weak or missing.
- Each pattern links to a dedicated document in this folder.

## Implemented Patterns

- Modular Frontend Composition: Shell-driven composition of feature frontends with modular route and API boundaries. See [composite-ModularFrontendComposition.md](composite-ModularFrontendComposition.md).
- Backend Per Feature API Boundary: Feature frontends call dedicated backend domains and module-specific API surfaces. See [composite-BackendPerFeatureApiBoundary.md](composite-BackendPerFeatureApiBoundary.md).
- Parallel Feature Implementations: quest3Tier, quest5Tier, and quest5TierEg provide concurrent implementations of the same business capability. See [composite-ParallelFeatureImplementations.md](composite-ParallelFeatureImplementations.md).
- Basic 3-Tier Structure: Direct UI -> API -> DB flow for simple synchronous CRUD scenarios. See [Basic3TierStructure.md](Basic3TierStructure.md).
- Partial 5-Tier Async: Mixes direct calls and queued asynchronous business processing. See [composite-Partial5TierAsync.md](composite-Partial5TierAsync.md).
- CQRS 5-Tier With Full Event Sourcing For Commands: Splits command/query flows and applies event sourcing for command handling. See [composite-CQRS5TierEventSourcingCommands.md](composite-CQRS5TierEventSourcingCommands.md).
- Layered Architecture: Clear separation across handler, service, repository, and schema concerns for maintainability and testability. See [LayeredArchitecture.md](LayeredArchitecture.md).
- Repository Pattern: Data access is encapsulated behind repositories used by business services. See [RepositoryPattern.md](RepositoryPattern.md).
- Event-Driven Architecture: Modules use event queues for asynchronous processing and decoupled execution. See [EventDrivenArchitecture.md](EventDrivenArchitecture.md).
- CQRS: Command and query flows are split into distinct paths for write/read optimization. See [CQRS.md](CQRS.md).
- Event Sourcing: Domain changes are persisted as event records to support traceability and replay. See [EventSourcing.md](EventSourcing.md).
- Idempotent Command Processing: Command retries and side effects are designed to avoid duplicate business outcomes. See [composite-IdempotentCommandProcessing.md](composite-IdempotentCommandProcessing.md).
- Correlation IDs: Transaction-level identifiers provide end-to-end traceability across distributed components. See [composite-ObservabilityAndCorrelation.md](composite-ObservabilityAndCorrelation.md).
- Deployment Automation: Scripted and IaC-driven deployment workflow supports consistent infrastructure and application rollout. See [composite-DeploymentAutomation.md](composite-DeploymentAutomation.md).
- API Gateway: Edge routing and policy enforcement are centralized in API Management. See [ApiGateway.md](ApiGateway.md).
- Retry And Backoff: Queue and messaging operations use retry logic to handle transient failures. See [RetryAndBackoff.md](RetryAndBackoff.md).
- Caching Strategy: Caching is applied at edge, auth metadata, and client layers where appropriate. See [CachingStrategy.md](CachingStrategy.md).
- Shared Kernel: Shared packages provide reusable cross-module capabilities. See [composite-SharedKernel.md](composite-SharedKernel.md).
- Tenant Boundary: Authentication and validation logic enforce tenant-aware identity boundaries. See [TenantBoundary.md](TenantBoundary.md).

## Candidate Patterns

- Candidate patterns with limited or no implementation evidence are tracked in [CandidatePatterns.md](CandidatePatterns.md).
- Feature RBAC and entitlement routing is documented as a required missing pattern in [composite-FeatureRbacAndEntitlementRouting.md](composite-FeatureRbacAndEntitlementRouting.md).
- Runtime remote frontend modules are documented as a required missing pattern in [composite-RuntimeRemoteFrontendModules.md](composite-RuntimeRemoteFrontendModules.md).

## Maintenance Workflow

- When adding or changing architecture patterns, update the related pattern document first.
- Add or update the matching bullet in this index with a one-line summary.
- Keep pattern names consistent with module names and folder casing in the repository.
- Promote a candidate to implemented only after adding concrete code evidence.
