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

---

## Quick Start (Local)

```bash
# 1. Copy env file
cp .env.example .env

# 2. Edit .env — set JWT_SECRET to something long and random
#    Generate one: openssl rand -base64 48

# 3. Start everything
docker compose up --build
```

App will be at http://localhost:3000

---

## Production Deploy on VPS

### Prerequisites
- Docker + Docker Compose v2 installed
- Domain pointed at your VPS (optional but recommended)

### Steps

```bash
# 1. Clone the repo on your VPS
git clone <your-repo> linguaflame
cd linguaflame

# 2. Create production .env
cp .env.example .env
nano .env
```

Fill in `.env`:
```env
JWT_SECRET=<output of: openssl rand -base64 48>
CORS_ORIGIN=https://yourdomain.com
WEB_PORT=80
```

```bash
# 3. Build and start
docker compose up -d --build

# 4. Check logs
docker compose logs -f
```

### HTTPS with Nginx reverse proxy (recommended)

If you have a domain, put Nginx/Caddy in front:

**Caddy (simplest — auto HTTPS):**
```
yourdomain.com {
    reverse_proxy localhost:3000
}
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
