<fragment>
    <set-variable name="forwardedHost"
        value="@(context.Request.Headers.GetValueOrDefault("X-Forwarded-Subdomain","").Trim().ToLowerInvariant())" />
%{ if length(backends) > 0 }
    <choose>
%{ for backend in backends ~}
        <when condition="@(context.Variables.GetValueOrDefault<string>("forwardedHost") == "${backend}")">
            <set-backend-service backend-id="${backend}" />
%{ if backend == "ui" }
            <!-- SPA routing -->
            <choose>
                <when condition="@(!System.Text.RegularExpressions.Regex.IsMatch(
                    context.Request.OriginalUrl.Path,
                    @"\.(js|css|png|jpg|svg|ico)$"
                ))">
                    <rewrite-uri template="/index.html" />
                </when>
                <otherwise>
                    <rewrite-uri template="/index.html" />
                </otherwise>
            </choose>
%{ endif }
        </when>
%{ if backend == "www" }
        <when condition="@(context.Variables.GetValueOrDefault<string>("forwardedHost") == "${targetEnv}")">
            <set-backend-service backend-id="${backend}" />
        </when>
%{ endif }
%{ endfor ~}
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