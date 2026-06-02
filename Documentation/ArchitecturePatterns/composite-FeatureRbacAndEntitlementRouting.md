# Feature RBAC And Entitlement Routing

## Intent

Restrict feature visibility and feature endpoint access by user role/entitlement so module access can be assigned to specific user groups.

## Problem

Authentication exists, but role-aware feature gating is not enforced end-to-end. This prevents controlled rollout and role-specific access assignment.

## Aspirational Pattern Structure

- User role claims are normalized into feature entitlements.
- Route composition and navigation visibility are filtered by entitlements.
- Backend handlers enforce role/entitlement checks per feature operation.
- Authorization policy is centralized to avoid duplicated conditional logic.

## Current Code References

- Role claims captured in profile model: [ui/app/providers/AuthProvider.tsx](../../ui/app/providers/AuthProvider.tsx)
- Protected layout checks auth state only: [ui/app/layouts/protected2.tsx](../../ui/app/layouts/protected2.tsx)
- Sidebar currently lists all quest modules for authenticated users: [ui/app/components/Sidebar.tsx](../../ui/app/components/Sidebar.tsx)
- Backend token decode and identity extraction without role checks: [module/quest5Tier/func/handler/handlerWrapper.js](../../module/quest5Tier/func/handler/handlerWrapper.js)
- Function endpoints currently configured as anonymous and app-level token validated: [module/quest5Tier/func/route.js](../../module/quest5Tier/func/route.js)

## Gap Assessment

- Missing feature-to-role mapping model.
- Missing route-level entitlement guard.
- Missing backend authorization policy enforcement by operation.

## Required Enhancements

- Define role-to-feature entitlement mapping (for example in shared config).
- Enforce entitlement checks in shell route composition and sidebar rendering.
- Enforce role or scope checks in backend handler wrappers and operation handlers.
- Add authorization audit logs and negative-path tests for denied access.

## Pattern Implementation Status

Still to be implemented.
