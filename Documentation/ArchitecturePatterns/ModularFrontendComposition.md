# Modular Frontend Composition

## Intent

Compose a single user portal from independently owned feature frontends, while keeping feature routing and API boundaries modular.

## Problem

A single monolithic frontend makes it hard to evolve feature implementations independently, especially when the same business capability is being explored with multiple architectural variants.

## Pattern Structure

- A shell application owns global authentication, layout, and top-level route composition.
- Each feature module exports its own route map.
- Feature routes are mounted into the shell routing tree under feature-specific path prefixes.
- Feature modules call their own backend API domains via module-local API clients.

## Code References

- Shell route composition: [ui/app/routes.ts](../../ui/app/routes.ts)
- Feature route modules: [module/quest3Tier/ui/routes.ts](../../module/quest3Tier/ui/routes.ts), [module/quest5Tier/ui/routes.ts](../../module/quest5Tier/ui/routes.ts), [module/quest5TierEg/ui/routes.ts](../../module/quest5TierEg/ui/routes.ts)
- Feature navigation in portal shell: [ui/app/components/Sidebar.tsx](../../ui/app/components/Sidebar.tsx)
- Feature-specific API domains: [ui/env.json](../../ui/env.json), [module/quest3Tier/ui/api/question.ts](../../module/quest3Tier/ui/api/question.ts), [module/quest5Tier/ui/api/question.ts](../../module/quest5Tier/ui/api/question.ts), [module/quest5TierEg/ui/api/question.ts](../../module/quest5TierEg/ui/api/question.ts)

## Current Implementation Assessment

- Implemented as build-time modular composition.
- Clear separation of route namespaces and feature API clients.
- Shared shell concerns (auth, navigation, layout) are centralized.

## Required Enhancements

- Add explicit module contracts for feature registration to reduce manual shell imports.
- Add module ownership metadata and versioning policy for feature route bundles.
- Add feature-level entitlement checks in route composition and navigation visibility.

## Pattern Implementation Status

Implemented (build-time composition model).
