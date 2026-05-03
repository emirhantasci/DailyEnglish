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
- **Images**: Hosted on **GitHub Container Registry (GHCR)** — public, no login needed

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

### Step 1: Copy files to VPS

VPS'te sadece 2 dosyaya ihtiyacın var:

```bash
# VPS'te bir klasör oluştur
mkdir -p ~/linguaflame && cd ~/linguaflame

# docker-compose.yml ve .env dosyalarını buraya koy
# (GitHub'dan çekebilir veya manuel oluşturabilirsin)
```

### Step 2: .env dosyasını düzenle

```bash
nano .env
```

```env
JWT_SECRET=0073sqy5qcuYwVMOiFceXdOu33iKGZ3rXMmcot8eGRk9Q3Mn1ZrTXGHBMU5Z/yez
CORS_ORIGIN=http://VPS_IP_ADRESIN:3000
WEB_PORT=3000
```

> **Önemli**: `CORS_ORIGIN` değerini VPS'in IP adresi veya domain'in ile değiştir. Örn: `http://123.456.789.0:3000` veya `https://senindomain.com`

### Step 3: Başlat

```bash
docker compose up -d
```

İmajlar GHCR'dan otomatik çekilecek, build gerekmez.

### Step 4: Kontrol

```bash
docker compose logs -f
```

Uygulama `http://VPS_IP:3000` adresinde çalışıyor olacak.

---

## Güncelleme (Update)

Yeni kod push'ladığında GitHub Actions otomatik build edip GHCR'a yeni imaj push'lar. VPS'te güncellemek için:

```bash
cd ~/linguaflame
docker compose pull
docker compose up -d
```

---

## HTTPS with Nginx reverse proxy (recommended)

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
