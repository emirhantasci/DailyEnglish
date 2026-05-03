# 🚀 LinguaFlame — Deploy Guide (VPS / Docker)

## Architecture

```
Internet → Nginx (port 80/443)
              ├── /api/*  → .NET 8 API (port 5001, internal)
              └── /*      → React SPA (static files)
```

- **Database**: SQLite (file at `/app/data/linguaflame.db`, persisted via Docker volume)
- **Auth**: JWT Bearer tokens (30-day expiry, no email verification needed)
- **Users**: Email + password, bcrypt hashed
- **Deploy**: `.tar` image export → SCP → VPS load. No registry needed.

---

## Quick Start (Local)

```bash
cp .env.example .env
# Edit .env — set JWT_SECRET
docker compose up --build
```

App at http://localhost:3000

---

## Production Deploy on VPS

### Prerequisites
- Docker + Docker Compose v2 on VPS

### Step 1: Build & export images (on your Mac)

```bash
cd linguaflame
./build-save.sh
```

This creates:
- `linguaflame-web.tar`
- `linguaflame-api.tar`

### Step 2: Copy to VPS

```bash
# Create folder on VPS
ssh user@VPS_IP "mkdir -p ~/linguaflame"

# Copy files
scp linguaflame-web.tar linguaflame-api.tar docker-compose.yml .env user@VPS_IP:~/linguaflame/
```

### Step 3: Edit .env on VPS

```bash
ssh user@VPS_IP
cd ~/linguaflame
nano .env
```

```env
JWT_SECRET=0073sqy5qcuYwVMOiFceXdOu33iKGZ3rXMmcot8eGRk9Q3Mn1ZrTXGHBMU5Z/yez
CORS_ORIGIN=http://VPS_IP:3000
WEB_PORT=3000
```

> Replace `VPS_IP` with your actual VPS IP or domain.

### Step 4: Load & start

```bash
./load-images.sh
```

Or manually:
```bash
docker load -i linguaflame-web.tar
docker load -i linguaflame-api.tar
docker compose up -d
```

App at `http://VPS_IP:3000`

---

## Update (after code changes)

On your Mac:
```bash
./build-save.sh
scp linguaflame-web.tar linguaflame-api.tar user@VPS_IP:~/linguaflame/
```

On VPS:
```bash
cd ~/linguaflame
docker compose down
docker load -i linguaflame-web.tar
docker load -i linguaflame-api.tar
docker compose up -d
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
