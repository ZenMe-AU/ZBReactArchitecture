# Database Schema Maintenance

This folder contains Sequelize migration files used to manage database schema changes for this module.

## Migration File Format

Each migration file should follow the standard Sequelize format:

- **Filename:** Use the timestamped format: `YYYYMMDDHHMMSS-action-tablename.js` (e.g., `20230907120000-create-user.js`).
- **Exports:** Each file must export an object with two async functions:
  - `up(queryInterface, Sequelize)`: Defines the changes to apply (e.g., create tables, add columns).
  - `down(queryInterface, Sequelize)`: Defines how to revert those changes.

Example:

```js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Migration logic here
  },
  down: async (queryInterface, Sequelize) => {
    // Revert logic here
  },
};
```

## Execution in CI/CD Pipeline

When the CI/CD pipeline deploys a database migration:

1. The pipeline runs the Sequelize CLI command (usually `sequelize db:migrate`) to apply all pending migrations in this folder.
2. Migrations are executed in order based on their timestamped filenames.
3. The migration history is tracked in the database to prevent reapplying migrations.
4. Rollbacks can be performed using `sequelize db:migrate:undo` or `sequelize db:migrate:undo:all` if needed.

## Best Practices

- Always test migrations locally before committing.
- Use clear, descriptive names for migration files.
- Ensure each migration is reversible (implement both `up` and `down`).
- Do not edit migration files after they have been applied to production.

## References

- [Sequelize Migrations Documentation](https://sequelize.org/master/manual/migrations.html)

---

For questions or issues, contact the project maintainers.
