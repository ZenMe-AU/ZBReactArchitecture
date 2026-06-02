# Repository Pattern

## Intent

Encapsulate persistence logic behind repository abstractions so business services remain data-store agnostic.

## How It Is Implemented In This Repository

- Service layer depends on dedicated repositories for commands, events, and entity persistence.
- Repository methods isolate query/persistence details from orchestration logic.

## Key Evidence

- module/README.md
- module/quest5Tier/func/repository/cmdRepository.js
- module/quest5Tier/func/repository/eventRepository.js
- module/quest5Tier/func/service/questionService.js

## Trade-Offs

- Improves separation and testability.
- Can add indirection when domain logic is simple.

## Related Modules

- quest3Tier
- quest5Tier
- quest5TierEg
