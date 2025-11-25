# Profile Ingress (Front Door slice)

This folder contains the Profile module's Front Door slice, implemented as `ingressProfile.tf`. It is designed to be copied into `deploy/ingress/dist` and applied together with the environment ingress (`deploy/ingress/ingress.tf`).

What this slice creates:
- Origin group + origin for the Profile API (Function App)
- Route for the Profile API (default: `/api/profile/*`)
- Optional origin + route for the Profile landing/static content (default: `/profile/*`)

Important: `ingressProfile.tf` does not declare its own `terraform` or `provider` blocks and relies on the provider and environment variables declared by `deploy/ingress/ingress.tf`. This avoids duplicate provider/variable errors when both files are applied together.

## Variables

- Environment-provided (declared in `deploy/ingress/ingress.tf`):
	- `central_env`, `frontdoor_profile_name`, `frontdoor_endpoint_name`
	- `enable_web_origin`, `web_origin_host_override` (for env fallback/static)
- Module-provided (set via `TF_VAR_...` before apply or passed by scripts):
	- `target_env`: environment key (e.g., `dev`)
	- `module_name`: module key (e.g., `profile`)
	- `function_app_name`: Profile API Function App name
	- `resource_group_name`: RG of the Function App
	- Optional: `custom_domain_resource_id` (Front Door custom domain resource id to attach)
	- Optional: `api_route_pattern` (default `/api/profile/*`), `enable_api_route` (default `true`)
	- Optional: `web_route_pattern` (default `/profile/*`)

## How to run (recommended)

1) Build the dist folder (copies `ingressProfile.tf` alongside environment ingress):
```
Push-Location deploy/ingress
.\u005cbuild.ps1
Pop-Location
```
2) Apply from `deploy/ingress/dist` (uses both `ingress.tf` and `ingressProfile.tf`):
```
Push-Location deploy/ingress/dist
.\u005cdeploy.ps1
Pop-Location
```

Ensure module variables are set (examples):
```
$env:TF_VAR_target_env = "dev"
$env:TF_VAR_module_name = "profile"
$env:TF_VAR_function_app_name = "<func-app-name>"
$env:TF_VAR_resource_group_name = "<func-app-rg>"
# Optional
$env:TF_VAR_custom_domain_resource_id = "<fd-custom-domain-resource-id>"
$env:TF_VAR_api_route_pattern = "/api/profile/*"
$env:TF_VAR_enable_api_route = "true"
$env:TF_VAR_web_route_pattern = "/profile/*"
```

## Notes

- The environment ingress (`ingress.tf`) owns the shared Front Door endpoint, custom domain, and DNS; modules own their specific routes/origins.
- Avoid overlapping patterns with the environment catch‑all route `/*`. More specific patterns like `/api/profile/*` take precedence.
