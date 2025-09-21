# bootstrap folder overview

This folder is responsible for managing dependency injection and registration in the application. It contains the following main files:

- **index.js**

  - Combines and loads all the contents that need to be registered into the container.
  - Centralizes the configuration of all services, objects, or modules to be injected.

- **container.js**

  - Provides a container for storing, retrieving, and unregistering various services or objects.
  - Used for centralized management of dependencies such as database connections, services, repositories, telemetry, etc.
  - **Usage Example:**
    ```js
    const container = require("./container");
    // Register a value or service
    container.register("db", dbInstance);
    // Retrieve a value or service
    const db = container.get("db");
    ```

- **registry.js**

  - Executes the registration process, registering the contents defined in index.js into the container.
  - Provides a unified entry point for registration, ensuring all dependencies are correctly registered in the container.
  - **Usage Example:**
    ```js
    const registry = require("./registry");
    // Register a service or module
    registry.register("serviceName", serviceInstance);
    // Execute startup logic for all registered modules
    registry.startup();
    ```
