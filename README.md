# Shrtly - A url shortener

## Tech Stack
- Node.js
- Express
- PostgreSQL
- Redis

## Database Schema

### users
| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PRIMARY KEY, GENERATED ALWAYS AS IDENTITY |
| email | TEXT | UNIQUE, NOT NULL |
| password_hash | TEXT | NOT NULL |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

### urls
| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PRIMARY KEY, GENERATED ALWAYS AS IDENTITY |
| short_code | VARCHAR(7) | UNIQUE, NOT NULL |
| original_url | TEXT | NOT NULL |
| user_id | BIGINT | NOT NULL, FK → users(id) ON DELETE CASCADE |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

### clicks
| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PRIMARY KEY, GENERATED ALWAYS AS IDENTITY |
| url_id | BIGINT | NOT NULL, FK → urls(id) ON DELETE CASCADE |
| clicked_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |
| ip_address | INET | nullable |
| user_agent | TEXT | nullable |
| referrer | TEXT | nullable |

## Auth Flow

**Register:** `POST /api/auth/register` → `routes/auth.js` → `authController.register` → `authService.hashPassword` → insert into PostgreSQL → `authService.generateToken` → return JWT

**Login:** `POST /api/auth/login` → `routes/auth.js` → `authController.login` → query PostgreSQL → `authService.comparePassword` → `authService.generateToken` → return JWT

**Protected route:** Request → `middleware/auth.js` → `authService.verifyToken` → attaches `req.userId` → controller

## URL Flow

**Shorten:** `POST /api/url/` → `middleware/auth.js` → `routes/url.js` → `urlController.shortenUrl` → validate URL → `urlService.createShortUrl` → `shortCode.getNanoid` → collision check in PostgreSQL → insert into PostgreSQL → return short code

**Redirect:** `GET /:code` → `routes/redirect.js` → `redirectController.redirect` → `redirectService.getOriginalUrl` → check Redis cache → if miss, query PostgreSQL → store in Redis (TTL 1hr) → 302 redirect
