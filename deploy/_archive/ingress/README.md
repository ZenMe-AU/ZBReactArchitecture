FdEnvSegment (Front Door Env Slice)

Adds environment-specific pieces to the existing central Front Door profile:
- Always creates a per-env endpoint: `<env>-central-fd`
- Optionally adds routing to an API origin (origin group + origin + route)
- Optionally adds a custom domain + DNS (`<env>.<parent-domain>`)

Variables
- `central_env`: Central RG name (auto-read from `deploy/central.env` `CENTRAL_ENV`)
- `frontdoor_profile_name`: Central Front Door profile name (default `FrontDoor`)
- `environment_key`: Env key (falls back to `TARGET_ENV` from `deploy/.env`)
- `enable_routing`: Gate for routing resources (default `true`)
- `origin_host_override`: Explicit API origin host (e.g. `myfunc.azurewebsites.net`)
- `enable_web_origin`: Enable a static website origin/route for `/*` (default `true`)
- `web_origin_host_override`: Static web origin host (e.g. `mystorage.z8.web.core.windows.net`)
- `enable_custom_domain`: Create custom domain and DNS (default `true`)
- `parent_domain_name`: Parent DNS zone (falls back to `CENTRAL_DNS` in `central.env`)
- `dns_zone_resource_group`: RG that holds the DNS zone (defaults to `central_env`)
 - `central_env` is required. The slice uses this resource group to locate the central Front Door profile named `frontdoor_profile_name` (default `FrontDoor`).

Outputs
- `env_endpoint_host`: FD endpoint hostname
- `env_origin_host`: API origin host used (override; empty if none)
- `env_routing_enabled`: Whether routing resources were created
- `env_custom_domain`: Custom domain FQDN (empty if disabled)
- `env_cname_target`: Endpoint host the CNAME points to
- `env_txt_record_name`: Name of TXT record for domain validation

Usage (only two files needed)
The workflow only requires `rgSlice.tf` and `applyRgSlice.ps1`. The script reads `deploy/central.env` and `deploy/.env` for defaults and can auto-detect origins.

Endpoint + domain only (no routing)
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "deploy\frontdoorEnv\FdEnvSegment\applyRgSlice.ps1" -EnableRouting 0 -PlanOnly
```

Explicit origin override (deterministic)
```powershell
$env:TF_VAR_origin_host_override = "myapp.azurewebsites.net"
powershell -NoProfile -ExecutionPolicy Bypass -File "deploy\frontdoorEnv\FdEnvSegment\applyRgSlice.ps1" -EnableRouting 1 -PlanOnly
```

Use remote state for central profile name
Removed. The slice now discovers the central Front Door profile directly in Azure when `central_env` is not set.

Auto-detect origins during apply (default)
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "deploy\frontdoorEnv\FdEnvSegment\applyRgSlice.ps1" -EnvironmentKey <envKey>
```

Notes
- This module adds to the central Front Door; it does not replace it.
- API route matches `/api/*` and web route matches `/*`, both bound to the custom domain when enabled.
