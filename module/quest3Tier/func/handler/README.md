

## Design decisions
1. The handler folder should not have any data storage related dependencies, e.g. data storage must go through the Repository and must use an interface that's defined for the repository independent of the data storage backend used. For example sequelize or datatables dependencies must only exist in the repository and not in other areas of the project.
