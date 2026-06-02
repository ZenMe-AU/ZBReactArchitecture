# System Architecture Overview

This document provides a high-level overview of the system architecture, describing the main architectural patterns and how each module fits into the overall design.

# Summary

The system is designed with modularity and scalability in mind. Each module is implemented with an architecture best suited to its domain requirements, ranging from simple 3-tier CRUD flows to advanced event-driven and CQRS patterns. This approach enables the system to evolve and scale as new features and complexity are introduced.

# Multi Functional Platform

The platform is usable as a template for any business functionality that can be built on the presented architectural patterns.
The modules provide example business functionality based on specific patterns to showcase the patterns and guide developers when implementing new business functionality.

# Overarching Architectural Features

The system leverages several overarching architectural patterns to ensure flexibility, maintainability, and scalability:

- **Modular Design:** Each module is developed as an independent component with its own UI, API, business logic, deployment code, and database. This allows for isolated development, testing, and deployment.
- **Separation of Concerns:** Responsibilities are clearly divided between presentation, business logic, and data layers, reducing coupling and improving code clarity.
- **Modern frontend stack:** React + Vite for fast development and performance.
- **Infrastructure as code:** Terraform and PowerShell scripts automate deployment.
- **Event-Driven Architecture:** Modules that require asynchronous processing or decoupling utilize event queues, enabling scalable background operations and improved system responsiveness.
- **CQRS and Event Sourcing:** For complex domains, the system adopts Command Query Responsibility Segregation (CQRS) and event sourcing, supporting auditability, replayability, and high scalability.
- **Scalability and Extensibility:** The architecture is designed to support future growth, allowing new modules and patterns to be integrated as requirements evolve.
- **Shared utilities:** Common code is reused via the shared module.

These patterns collectively provide a robust foundation for building, evolving, and maintaining the platform.

# Code Folder Structure

# Modular Architecture Patterns

Detailed pattern documentation has been moved to the ArchitecturePatterns folder.

## Core Pattern Documents

- Basic 3-tier structure: [ArchitecturePatterns/Basic3TierStructure.md](ArchitecturePatterns/Basic3TierStructure.md)
- Partial 5-tier async: [ArchitecturePatterns/Partial5TierAsync.md](ArchitecturePatterns/Partial5TierAsync.md)
- CQRS 5-tier with full event sourcing for commands: [ArchitecturePatterns/CQRS5TierEventSourcingCommands.md](ArchitecturePatterns/CQRS5TierEventSourcingCommands.md)
- Event-driven architecture: [ArchitecturePatterns/EventDrivenArchitecture.md](ArchitecturePatterns/EventDrivenArchitecture.md)
- CQRS: [ArchitecturePatterns/CQRS.md](ArchitecturePatterns/CQRS.md)
- Event sourcing: [ArchitecturePatterns/EventSourcing.md](ArchitecturePatterns/EventSourcing.md)
- Correlation IDs: [ArchitecturePatterns/ObservabilityAndCorrelation.md](ArchitecturePatterns/ObservabilityAndCorrelation.md)

## Full Pattern Index

For all implemented and candidate patterns, see:

- [ArchitecturePatterns/README.md](ArchitecturePatterns/README.md)

## CI/CD, Deployment Automation

The system uses deployment scripts in conjunction with infrastructure as code to enable consistent deployment of the infrastructure as well as the application components

## Automation Layers

The deployment scripts are structured in layers to take best advantage of relevant scripting languages and enable flexibility for use in CI/CD pipelines, manual deployments, as well as local developer environments.

1. **Orchestration:**  
   This stage uses PowerShell to coordinate the deployment steps.
2. **Preparation:**  
   This stage uses JavaScript to prepare the environment and perform any complex calculations required for the next stage.
3. **Application:**  
   This stage uses Terraform or other required infrastructure as code library to deploy to the relevant backend environment.

## Prerequisites

For the deployment scripts to work, certain prerequisites of the environment must be met.

Azure subscription
EntraID user

The infrastructure deployment is automated using PowerShell (`deploy.ps1`) and Terraform scripts. The sequence follows these steps:

1. **Environment Preparation**
   - The PowerShell script initializes environment variables and configuration settings required for deployment (e.g., subscription, resource group, region).

2. **Terraform Initialization**
   - The script runs `terraform init` to set up the Terraform working directory and download required providers.

3. **Terraform Plan**
   - Executes `terraform plan` to preview infrastructure changes and validate the configuration.

4. **Terraform Apply**
   - Runs `terraform apply` to provision Azure resources, including:
     - Resource Group
     - Storage Account
     - Azure Service Bus
     - Application Insights
     - Cosmos DB or SQL Database (as required by modules)
     - Azure Functions and Static Web Apps

5. **Deployment of Application Code**
   - After infrastructure is provisioned, the script deploys application code:
     - Frontend (React/Vite) is built and deployed to Azure Static Web Apps.
     - Backend APIs and Azure Functions are published to their respective Azure resources.

6. **Configuration and Secrets**
   - The script configures connection strings, secrets, and environment variables for each module, ensuring secure integration between services.

7. **Verification and Output**
   - Outputs resource endpoints and connection details.
   - Verifies successful deployment by checking resource health/status.

This sequence ensures consistent, repeatable, and secure deployment of the full stack application and its supporting infrastructure.
