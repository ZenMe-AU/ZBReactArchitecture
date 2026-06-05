# Parallel Feature Implementations

## Intent

Support concurrent implementations of the same business functionality so architecture choices can be compared in a single platform.

## Problem

Teams need to evaluate architectural trade-offs without losing functional parity or forcing early convergence to a single approach.

## Pattern Structure

- The same quest business journeys exist in multiple feature variants.
- Variants are exposed under separate route namespaces.
- Variants use distinct backend architecture styles while preserving user-facing capability parity.

## Code References

- Quest 3-tier routes: [module/quest3Tier/ui/routes.ts](../../module/quest3Tier/ui/routes.ts)
- Quest 5-tier routes: [module/quest5Tier/ui/routes.ts](../../module/quest5Tier/ui/routes.ts)
- Quest 5-tier event-grid variant routes: [module/quest5TierEg/ui/routes.ts](../../module/quest5TierEg/ui/routes.ts)
- Shell composition of all variants: [ui/app/routes.ts](../../ui/app/routes.ts)
- Variant frontend API clients: [module/quest3Tier/ui/api/question.ts](../../module/quest3Tier/ui/api/question.ts), [module/quest5Tier/ui/api/question.ts](../../module/quest5Tier/ui/api/question.ts), [module/quest5TierEg/ui/api/question.ts](../../module/quest5TierEg/ui/api/question.ts)

## Current Implementation Assessment

- Implemented.
- The three quest variants are active concurrent implementations of the same feature set.
- Variant isolation is clear at route and API boundary level.

## Required Enhancements

- Add explicit parity tests to verify all quest variants keep functional equivalence.
- Add documented migration policy for promoting one variant to default.
- Add runtime feature selection policy so user cohorts can be routed by entitlement or experimentation rules.

## Pattern Implementation Status

Implemented.
