# 🚀 InternHub Project Setup Guide

Follow these steps to run the project locally.

---

## 📦 1. Clone Repository

```bash
git clone https://github.com/patel-raj20/InternHub
cd InternHub
```

---

## 🌿 2. Create Your Branch

```bash
git checkout -b <your-name>
```

---

## 🔐 3. Setup Environment Variables

Create your local env file:

```bash
cp .env.example .env.local
```

---

## 🐳 4. Start Database (Docker)

Make sure Docker Desktop is running.

```bash
docker-compose up -d
```

---

## 🧱 5. Initialize Database

Database schema will be automatically created from SQL files.

If you face issues or after schema updates, run:

```bash
docker-compose down -v
docker-compose up -d
```

---

## ▶️ 6. Run the Project

```bash
npm install
npm run dev
```

---

## 🌐 7. Access Application

Frontend:
http://localhost:3000

Database UI (pgAdmin):
http://localhost:5050

---

## 🔑 pgAdmin Login

```
Email: admin@internhub.com
Password: admin
```

---

## 🔗 Connect Database in pgAdmin

Use these credentials:

```
Host: db
Port: 5432
Database: internhub
Username: postgres
Password: postgres
```

---

## ⚠️ Important Notes

* Do NOT manually create database
* Do NOT change SQL files randomly
* Always pull latest changes before starting

---

## 🔄 When Database Schema Changes

```bash
docker-compose down -v
docker-compose up -d
```

---

## 🧠 Common Issues

### ❌ Docker not running

→ Start Docker Desktop

### ❌ Database not found

→ Reset using:

```bash
docker-compose down -v
```

### ❌ Port already in use

→ Change port in `docker-compose.yml`

---

## ✅ You're Ready!

Now you can start working on your assigned tasks 🚀

---

# 🚀 Hasura GraphQL Setup Guide [ New ]

This guide explains how to set up and run Hasura GraphQL locally with the InternHub project.

---

## 📌 Overview 

We are using **Hasura GraphQL Engine** to automatically generate GraphQL APIs from our PostgreSQL database.

---

## 🧱 1. Add Hasura to Docker

Open the `docker-compose.yml` file and add the following service:

```yaml
hasura:
  image: hasura/graphql-engine:v2.36.0
  ports:
    - "8080:8080"
  depends_on:
    - db
  environment:
    HASURA_GRAPHQL_DATABASE_URL: postgres://postgres:postgres@db:5432/internhub
    HASURA_GRAPHQL_ENABLE_CONSOLE: "true"
    HASURA_GRAPHQL_DEV_MODE: "true"
    HASURA_GRAPHQL_ADMIN_SECRET: myadminsecretkey
```

---

## 🐳 2. Restart Docker Services

After updating `docker-compose.yml`, run:

```bash
docker-compose down
docker-compose up -d
```

---

## 🌐 3. Access Hasura Console

Open in browser:

http://localhost:8080

Enter admin secret:

```
myadminsecretkey
```

---

## 🧱 4. Database Connection

Database connects automatically using:

```
postgres://postgres:postgres@db:5432/internhub
```

---

## 📊 5. Track Tables

Hasura does not expose tables automatically.

Steps:

1. Go to **Data Tab**
2. Select **public schema**
3. Click **Track** on required tables

---

## 🔍 6. Test GraphQL API

Go to **GraphiQL Tab** and run:

```graphql
query {
  users {
    user_id
    name
    email
  }
}
```

---

## 🧠 Architecture

```
Frontend (Next.js)
        ↓
   Hasura GraphQL
        ↓
   PostgreSQL (Docker)
```

---

## ⚠️ Important Notes

* Do NOT change database credentials
* Always pull latest code before running
* Track new tables after schema updates
* Do NOT expose admin secret publicly

---

## 🔄 When Database Changes

```bash
docker-compose down -v
docker-compose up -d
```

Then re-track tables in Hasura.

---

## 🧪 Common Issues

### ❌ Hasura not opening

→ Ensure Docker is running

### ❌ No tables visible

→ Click **Track Tables**

### ❌ Connection error

→ Check database URL:

```
postgres://postgres:postgres@db:5432/internhub
```

---

## ✅ You're Ready!

Hasura is now integrated and ready to use 🚀
