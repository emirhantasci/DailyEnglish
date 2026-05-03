# 🚀 LinguaFlame — Deploy Guide (VPS / Docker)

## Architecture

```
Internet → Traefik/Nginx (port 80/443)
              ├── /api/*  → .NET 8 API (port 5001, internal)
              └── /*      → React SPA (static files)
```

- **Project Structure**: Separated into `api/` and `ui/` directories.
- **Database**: SQLite (file at `/app/data/linguaflame.db`, persisted via Docker volume)
- **Auth**: JWT Bearer tokens (30-day expiry)
- **Deploy**: Run `docker compose up --build` directly on VPS.

---

## Production Deploy on VPS

### Prerequisites
- Docker + Docker Compose v2 installed on VPS.
- Git to clone the repository.

### Step 1: Clone the Repo

```bash
# SSH into your VPS and clone the project
git clone https://github.com/emirhantasci/DailyEnglish.git
cd DailyEnglish/linguaflame
```

### Step 2: Edit .env

```bash
cp .env.example .env
nano .env
```

```env
JWT_SECRET=0073sqy5qcuYwVMOiFceXdOu33iKGZ3rXMmcot8eGRk9Q3Mn1ZrTXGHBMU5Z/yez
CORS_ORIGIN=https://linguaflame.emirhantasci.cloud
WEB_PORT=3000
```

> **Note**: Update `CORS_ORIGIN` with your actual domain or VPS IP.

### Step 3: Build & Start

```bash
# This will build the api and ui containers locally on the VPS and start them
docker compose up -d --build
```

### Step 4: Check Logs

```bash
docker compose logs -f
```

App will be available at `http://VPS_IP:3000` (or your domain via Traefik).

---

## Update (after code changes)

When you push new code to GitHub, simply pull it on the VPS and rebuild:

```bash
cd ~/DailyEnglish/linguaflame
git pull
docker compose up -d --build
```

---

## HTTPS with Caddy (recommended)

```
yourdomain.com {
    reverse_proxy localhost:3000
}
```
```

**Nginx:**
```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;
    # ... ssl certs ...

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | None | Health check |
| POST | `/api/auth/register` | None | Register new user |
| POST | `/api/auth/login` | None | Login, get JWT |
| GET | `/api/auth/me` | Bearer | Current user info |
| GET | `/api/progress` | Bearer | Get user progress |
| PUT | `/api/progress` | Bearer | Save user progress |
| GET | `/api/leaderboard` | Bearer | Top 20 by streak |

### Register example
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","displayName":"Alice","password":"secret123"}'
```

---

## Backup

The SQLite database is in the `api-data` Docker volume:

```bash
# Backup
docker run --rm -v linguaflame_api-data:/data -v $(pwd):/backup \
  alpine tar czf /backup/linguaflame-backup-$(date +%Y%m%d).tar.gz /data

# Restore
docker run --rm -v linguaflame_api-data:/data -v $(pwd):/backup \
  alpine tar xzf /backup/linguaflame-backup-YYYYMMDD.tar.gz -C /
```

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `JWT_SECRET` | ✅ Yes | — | Min 32 chars, random |
| `CORS_ORIGIN` | ✅ Yes | `http://localhost:3000` | Frontend URL for CORS |
| `WEB_PORT` | No | `3000` | Host port for web container |
