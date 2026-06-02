# Backend Per Feature API Boundary

## Intent

Keep frontend features coupled to bounded backend APIs so each feature can evolve independently without cross-feature endpoint drift.

## Problem

When multiple feature implementations share business behavior, API coupling can become unclear unless each frontend explicitly targets its own backend boundary.

## Pattern Structure

- Each feature frontend API client resolves its own backend domain.
- Feature backends expose module-specific route conventions.
- Shared transport/auth mechanics are reused without collapsing feature boundaries.

## Code References

- Feature API clients: [module/quest3Tier/ui/api/question.ts](../../module/quest3Tier/ui/api/question.ts), [module/quest5Tier/ui/api/question.ts](../../module/quest5Tier/ui/api/question.ts), [module/quest5TierEg/ui/api/question.ts](../../module/quest5TierEg/ui/api/question.ts)
- Feature backend domains: [ui/env.json](../../ui/env.json)
- Backend route boundaries: [module/quest3Tier/func/route.js](../../module/quest3Tier/func/route.js), [module/quest5Tier/func/route.js](../../module/quest5Tier/func/route.js), [module/quest5TierEg/func/route.js](../../module/quest5TierEg/func/route.js)
- Shared authenticated transport: [ui/api/jwtFetch.ts](../../ui/api/jwtFetch.ts)

## Current Implementation Assessment

- Implemented.
- Frontend modules target dedicated backend domains and route shapes.
- API boundary differences reflect architectural differences across quest variants.

## Required Enhancements

- Define a canonical API capability matrix across quest variants to reduce accidental divergence.
- Add contract tests that verify equivalent business capability coverage across implementations.
- Add explicit deprecation/version strategy for endpoint evolution per feature variant.

## Pattern Implementation Status

Implemented.
