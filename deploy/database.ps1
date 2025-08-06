
# Get Azure AD access token for PostgreSQL
$token = az account get-access-token --resource-type oss-rdbms --query accessToken -o tsv

$envname = Get-Content terraform.tfvars | Select-String -Pattern "env_name" | ForEach-Object { $_ -replace 'env_name\s*=\s*', '' }

# Connection details
$server = "$envname-postresqlserver.postgres.database.azure.com"
$database = "questionv3"
$azAccount = az account show | ConvertFrom-Json
$user = $azAccount.user.name
$tenantId = $azAccount.tenantId
$userFull = "$user@$tenantId"
$port = 5432

# Run DDL using psql with access token as password
$env:PGPASSWORD = $token
psql "host=$server port=$port dbname=$database user=$user sslmode=require" -c "<your-ddl-statement>"

# Clear the password from environment
Remove-Item Env:PGPASSWORD
