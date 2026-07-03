<fragment>
    <set-variable name="forwardedHost"
        value="@(context.Request.Headers.GetValueOrDefault("X-Forwarded-Subdomain","").Trim().ToLowerInvariant())" />
%{ if length(backends) > 0 }
    <choose>
        <when condition="@(new []{${join(",", [for b in backends : "\"${b}\""])}}.Contains(context.Variables.GetValueOrDefault<string>("forwardedHost")))">
            <set-backend-service backend-id="@(context.Variables.GetValueOrDefault<string>("forwardedHost"))" />
        </when>
%{ if contains(backends, "www") }
        <when condition="@(context.Variables.GetValueOrDefault<string>("forwardedHost") == "${targetEnv}")">
            <set-backend-service backend-id="www" />
        </when>
%{ endif }
        <otherwise>
            <return-response>
                <set-status code="404" reason="Not Found" />
                <set-body>@("Unknown host: " + context.Variables.GetValueOrDefault<string>("forwardedHost") + ", X-Forwarded-Subdomain: " + context.Request.Headers.GetValueOrDefault("X-Forwarded-Subdomain") + ", X-Forwarded-Host: " + context.Request.Headers.GetValueOrDefault("X-Forwarded-Host", ""))</set-body>
            </return-response>
        </otherwise>
    </choose>
%{ else }
    <return-response>
        <set-status code="404" />
        <set-body>@("No backends configured")</set-body>
    </return-response>
%{ endif }
</fragment>