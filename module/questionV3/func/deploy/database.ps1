
# Get Azure AD access token for PostgreSQL
$token = az account get-access-token --resource-type oss-rdbms --query accessToken -o tsv

$envname = Get-Content terraform.tfvars | Select-String -Pattern "env_name" | ForEach-Object { $_ -replace 'env_name\s*=\s*', '' }
$modulename = Get-Content terraform.tfvars | Select-String -Pattern "module_name" | ForEach-Object { $_ -replace 'module_name\s*=\s*', '' }

# Connection details
$server = "$envname-postresqlserver.postgres.database.azure.com"
$database = $modulename
$azAccount = az account show | ConvertFrom-Json
$user = $azAccount.user.name
$tenantId = $azAccount.tenantId
$userFull = "$user@$tenantId"
$port = 5432

$connectionstring = "postgres://${userFull}:${token}@${server}:${port}/${database}"


& npx sequelize-cli db:migrate --url $connectionstring --migrations-path "../db/migration"
 

