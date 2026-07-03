# API Gateway

## Intent

Centralize API routing, policy enforcement, and observability controls at the edge.

## How It Is Implemented In This Repository

- Azure API Management defines gateway APIs and backend routing.
- Shared policy fragments control request flow and cross-cutting concerns.
- Gateway diagnostics feed telemetry pipelines.

## Key Evidence

- deploy/deployEnv/apim.tf
- deploy/deployEnv/apimPolicy.xml
- deploy/deployEnv/apimPolicyAllOperations.xml
- deploy/deployEnv/apimPolicyDefault.xml

## Trade-Offs

- Central governance and policy reuse.
- Additional deployment and policy maintenance surface area.

## Related Modules

- deploy
- all API-facing modules

## Wikipedia Reference

- API gateway: https://en.wikipedia.org/wiki/API_gateway
