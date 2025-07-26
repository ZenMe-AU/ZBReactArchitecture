# 🐘 Local PostgreSQL Dev Environment with pgAdmin

This repo provides a ready-to-use PostgreSQL environment for local development, with optional pgAdmin GUI.

## Prerequisites

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- Make (optional, for convenience)

---

## 📦 Features

- PostgreSQL 16 (configurable)
- pgAdmin 4 web GUI (auto-connected)
- Configurable via `.env`
- Docker Compose based
- Easy start/stop/reset via `make` or shell scripts
- Compatible with migration-based schema setup

---

## 🧑‍💻 Usage

For Windows Users – Manual Operation
If you’re using Windows without make, you can manually operate by either using a terminal or `double-clicking` the provided .sh files (via Git Bash or WSL).

### 1. Get into folder

```bash
cd dbDev
```

### 2. Initialize config (first time only)

```bash
make init
```

#### For Windows Users(via Git Bash)

```
bash script/init.sh
```

### 3. Start the environment

```bash
make start
```

### 4. Access the services

- PostgreSQL: localhost:5432
- pgAdmin: http://localhost:5050
- pgAdmin Servers Login: POSTGRES_ADMIN_USER / POSTGRES_ADMIN_PASSWORD

### Create Module Databases

```bash
make db
```

---

## 🧼 Cleanup

To stop and remove everything (including data)

```bash
make stop
```

---

## 🔧 Commands

| Command      | Description                            |
| ------------ | -------------------------------------- |
| `make init`  | Create config files                    |
| `make start` | Start PostgreSQL & pgAdmin             |
| `make stop`  | Stop and remove containers & volumes   |
| `make reset` | Reset everything (stop → init → start) |
| `make logs`  | View logs of services                  |
| `make db`    | Create Database                        |

---

## 🗂 Environment Variables

Set in config.env:
| Variable | Purpose |
|---------------------------|----------------------------|
| `POSTGRES_DB` | Initial database name |
| `POSTGRES_USER` | PostgreSQL user |
| `POSTGRES_PASSWORD` | PostgreSQL password |
| `POSTGRES_PORT` | Host port for PostgreSQL |
| `PGADMIN_DEFAULT_EMAIL` | pgAdmin login email |
| `PGADMIN_DEFAULT_PASSWORD`| pgAdmin login password |
| `PGADMIN_PORT` | Host port for pgAdmin |
