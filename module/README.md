This folder contains all full-stack modules. Each subfolder represents a distinct domain module. Each module follows a standard structure:

- **func**: Contains backend logic and services.
  - **.vscode**: VS Code workspace settings.
  - **db**: Database related files.
    - **migration**: Database migration scripts.
    - **model**: Database models.
    - **seeder**: Data seeders for initial data.
  - **deploy**: Deployment configurations.
    - **code**: Deployment scripts/code.
    - **env**: Environment variables/configs.
    - **schema**: Deployment schema definitions.
  - **handler**: Request/response handlers.
  - **repository**: Data access layer.
  - **schema**: Data validation schemas.
  - **service**: Business logic services.
  - **swagger**: API documentation.
  - **test**: Backend tests.
    - **service**: Service layer tests.
    - **testModule**: Module-specific tests.
- **ui**: Contains frontend code.
  - **api**: API interface definitions.
  - **routes**: Application routes.
  - **types**: Type definitions.

**Running UI Locally**

1. Ensure you have followed the global setup steps in the main README.MD related to azure-functions-core-tools
2.

**Running Everything Locally**

1. Ensure you have followed the global setup steps in the main README.MD related to azure-functions-core-tools
2. In each module/modulename/func folder run the following:
3. `func init` and select Node; javascript
   pnpm run setup:local
4. `func start` and give firewall access if asked to run the function app locally.
