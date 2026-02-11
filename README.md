# Shrtly

A URL shortener API built with Node.js, Express, PostgreSQL, and Redis.

## Features

- **URL Shortening** — generate short codes via base62 encoding or custom slugs
- **Redirect** — fast redirects with Redis cache-aside pattern
- **JWT Authentication** — register/login, protected endpoints
- **Click Analytics** — track clicks with IP, user-agent, referrer data
- **URL Expiration** — optional TTL per URL (e.g., "1h", "7d", "30d")
- **Rate Limiting** — sliding window rate limiter using Redis sorted sets

## Tech Stack

- **Node.js** + **Express** — API server
- **PostgreSQL** — source of truth
- **Redis** — caching, rate limiting
- **JWT** — authentication
- **bcrypt** — password hashing

## Getting Started

### Prerequisites

- Node.js
- PostgreSQL
- Redis

### Setup

1. Clone the repo
   ```bash
   git clone https://github.com/<your-username>/shrtly.git
   cd shrtly
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env` file
   ```
   PORT=3000
   DATABASE_URL=postgresql://localhost:5432/shrtly
   REDIS_URL=redis://localhost:6379
   JWT_SECRET=your-secret-key-change-this
   ```

4. Create the database and tables
   ```bash
   createdb shrtly
   ```
   Then connect with `psql shrtly` and run:
   ```sql
   CREATE TABLE users (
     id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
     email TEXT UNIQUE NOT NULL,
     password_hash TEXT NOT NULL,
     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
   );

   CREATE TABLE urls (
     id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
     short_code VARCHAR(20) UNIQUE,
     original_url TEXT NOT NULL,
     user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
     expires_at TIMESTAMPTZ DEFAULT NULL
   );

   CREATE TABLE clicks (
     id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
     url_id BIGINT NOT NULL REFERENCES urls(id) ON DELETE CASCADE,
     clicked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
     ip_address INET,
     user_agent TEXT,
     referrer TEXT
   );

   CREATE INDEX idx_clicks_url_id ON clicks(url_id);
   ```

5. Start the server
   ```bash
   npm run dev
   ```

## API Endpoints

### Auth

| Method | Endpoint | Body | Auth | Description |
|---|---|---|---|---|
| POST | `/api/auth/register` | `{ email, password }` | No | Register a new user, returns JWT |
| POST | `/api/auth/login` | `{ email, password }` | No | Login, returns JWT |

### URLs

| Method | Endpoint | Body | Auth | Description |
|---|---|---|---|---|
| POST | `/api/url/` | `{ originalUrl, customSlug?, expiresIn? }` | Yes | Create a short URL |
| GET | `/api/url/:code/stats` | — | Yes | Get click analytics (owner only) |
| GET | `/:code` | — | No | Redirect to original URL |

### Other

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Health check |

### Example Usage

**Register:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "secret123"}'
```

**Create short URL:**
```bash
curl -X POST http://localhost:3000/api/url/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"originalUrl": "https://www.google.com"}'
```

**Create with custom slug and expiration:**
```bash
curl -X POST http://localhost:3000/api/url/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"originalUrl": "https://www.google.com", "customSlug": "goog", "expiresIn": "7d"}'
```

**Redirect:**
```
GET http://localhost:3000/<shortCode> → 302 redirect
```

**View analytics:**
```bash
curl http://localhost:3000/api/url/<shortCode>/stats \
  -H "Authorization: Bearer <token>"
```

## Project Structure

```
src/
├── app.js                          # Express app setup
├── server.js                       # Entry point, connects DB/Redis
├── config/
│   └── index.js                    # Environment config
├── db/
│   └── index.js                    # PostgreSQL connection pool
├── redis/
│   └── index.js                    # Redis client
├── middleware/
│   ├── auth.js                     # JWT verification
│   └── rateLimit.js                # Sliding window rate limiter
├── routes/
│   ├── auth.js                     # /api/auth/*
│   ├── url.js                      # /api/url/*
│   └── redirect.js                 # /:code
├── controllers/
│   ├── authController.js           # Register, login
│   ├── urlController.js            # Shorten URL
│   ├── redirectController.js       # Redirect + log click
│   └── analyticsController.js      # URL stats
├── services/
│   ├── authService.js              # JWT + bcrypt helpers
│   ├── urlService.js               # URL creation with base62/custom slug
│   ├── redirectService.js          # Cache-aside URL lookup
│   └── analyticsService.js         # Click logging + stats queries
└── utils/
    ├── base62.js                   # Base62 encoder
    ├── shortCode.js                # Nanoid generator (legacy)
    ├── parseExpiry.js              # Parse "1h", "7d" into dates
    └── ValidationError.js          # Custom error class
```

## Database Schema

### users
| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PK, GENERATED ALWAYS AS IDENTITY |
| email | TEXT | UNIQUE, NOT NULL |
| password_hash | TEXT | NOT NULL |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

### urls
| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PK, GENERATED ALWAYS AS IDENTITY |
| short_code | VARCHAR(20) | UNIQUE |
| original_url | TEXT | NOT NULL |
| user_id | BIGINT | NOT NULL, FK → users(id) ON DELETE CASCADE |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |
| expires_at | TIMESTAMPTZ | nullable, DEFAULT NULL |

### clicks
| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PK, GENERATED ALWAYS AS IDENTITY |
| url_id | BIGINT | NOT NULL, FK → urls(id) ON DELETE CASCADE |
| clicked_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |
| ip_address | INET | nullable |
| user_agent | TEXT | nullable |
| referrer | TEXT | nullable |

## Request Flows

**Auth:**
`POST /api/auth/register` → `authController.register` → `authService.hashPassword` → insert into PostgreSQL → `authService.generateToken` → return JWT

**Shorten:**
`POST /api/url/` → `auth middleware` → `urlController.shortenUrl` → validate URL → `urlService.createShortUrl` → base62 encode (with transaction) or custom slug → insert into PostgreSQL → return short code

**Redirect:**
`GET /:code` → `redirectController` → `redirectService.getOriginalUrl` → check Redis cache → if miss, query PostgreSQL → cache in Redis → check expiration → log click (fire-and-forget) → 302 redirect

**Analytics:**
`GET /api/url/:code/stats` → `auth middleware` → `analyticsController.getUrlStats` → verify ownership → query total clicks, recent clicks, top referrers (parallel) → return stats

## Rate Limiting

Sliding window algorithm using Redis sorted sets.

| Route | Limit | Window |
|---|---|---|
| `/api/url/*` | 10 requests | 15 minutes |
| `/:code` (redirects) | 100 requests | 15 minutes |

Response headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
