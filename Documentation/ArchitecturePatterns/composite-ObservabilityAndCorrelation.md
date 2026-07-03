# Correlation IDs

Correlation IDs are unique identifiers attached to each transaction or request as it flows through the system. Their primary purpose is to enable end-to-end traceability, allowing developers and operators to follow a transaction from its origin (such as a user action in the UI) through APIs, event queues, business logic, and database operations.

Correlation IDs are generated at the UI layer with every user action and then propagated across all downstream components, including messages sent via Azure Service Bus. This ensures that every event, command, and data update related to a transaction carries the same correlation ID.

Integration with Azure Application Insights further enhances visibility. By including correlation IDs in telemetry data, logs, and traces, the system enables comprehensive monitoring and auditing. Operators can easily search for a specific correlation ID in App Insights to view the complete lifecycle of a transaction, identify bottlenecks, diagnose failures, and verify that all steps were executed as expected.

This approach provides robust auditability, simplifies debugging, and supports compliance requirements by making it straightforward to reconstruct the history of any transaction across distributed system components.

## Potential Change Notes

- Consider whether this document should include explicit references to OpenTelemetry instrumentation to align naming with broader observability practices.
