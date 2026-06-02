# Caching Strategy

## Intent

Reduce latency and downstream load by caching safe-to-reuse data at the appropriate boundary.

## How It Is Implemented In This Repository

- Edge caching is configured for static/resource delivery.
- Authentication metadata retrieval uses cached key material where supported.
- Client auth state uses local cache settings for session continuity.

## Key Evidence

- deploy/initEnv/app.tf
- module/quest5Tier/func/service/authUtils.js
- ui/auth/msalInstance.ts

## Trade-Offs

- Better performance and reduced external dependency pressure.
- Requires invalidation and freshness considerations for correctness.

## Related Modules

- ui
- deploy
- quest5Tier

## Wikipedia Reference

- Cache (computing): https://en.wikipedia.org/wiki/Cache_(computing)
