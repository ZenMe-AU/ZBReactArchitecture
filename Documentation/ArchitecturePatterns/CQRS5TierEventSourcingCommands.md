# CQRS 5-Tier With Full Event Sourcing For Commands

## Pattern

- Queries: UI -> Query -> API -> Business Query Logic -> DB (Read only)
- Commands: UI -> Command -> API -> Command Queue -> Business Command Logic -> DB -> Event Queue

- Implements Command Query Responsibility Segregation (CQRS).
- Event sourcing is used for commands, ensuring auditability and replayability.
- Read and write paths are fully separated, supporting scalability and complex business rules.
- Correlation IDs: Enable traceability of transactsion from user action to final result.

## Diagram

```mermaid
flowchart LR
    subgraph User Interface Flow
        UI1[Frontend UI]
        Q[Query]
        C[Command]
        UI1 --> C
        UI1 --> Q
        E[Event Listener]
        UIE[Updated UI]
        E --> UIE
    subgraph Query Flow
        APIQ[API Layer]
        BQL[Business Query Logic]
        DBQ[(Database - Read)]
        Q --> APIQ --> BQL --> DBQ
        Q --> UIE
    end

    %% Command Path
    subgraph Command Flow
        APIC[API Layer]
        CQ[Command Queue]
        BCL[Business Command Logic]
        DBC[(Database - Write)]
        EQ[Event Queue]
        C --> APIC --> CQ --> BCL --> DBC --> EQ --> E
    end
    end
```

## Modules Using This Pattern

- quest5Tier

## Potential Change Notes

- Potential module mapping mismatch with the architecture mapping table in Overview, which indicates a CQRS + event sourcing variant under `quest5TierEG`.
- Typo preserved from source: `transactsion` should likely be `transaction`.
