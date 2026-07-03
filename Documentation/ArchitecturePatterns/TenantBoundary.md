# Tenant Boundary

## Intent

Define identity and authorization boundaries clearly so authentication and data access remain scoped and predictable.

## How It Is Implemented In This Repository

- Tenant-aware identity configuration is wired in UI and backend token validation.
- Infrastructure configuration passes tenant context through deployment variables.

## Key Evidence

- ui/auth/msalInstance.ts
- module/quest5Tier/func/service/authUtils.js
- deploy/deployEnv/main.tf

## Trade-Offs

- Strong control over identity boundary assumptions.
- Multi-tenant evolution requires careful issuer and audience strategy updates.

## Related Modules

- ui
- quest5Tier
- deploy

## Wikipedia Reference

- Multitenancy: https://en.wikipedia.org/wiki/Multitenancy
