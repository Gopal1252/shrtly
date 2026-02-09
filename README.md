# Shrtly - A url shortener

## Tech Stack
- Node.js
- Express
- PostgreSQL
- Redis

## Auth Flow

**Register:** `POST /api/auth/register` → `routes/auth.js` → `authController.register` → `authService.hashPassword` → insert into PostgreSQL → `authService.generateToken` → return JWT

**Login:** `POST /api/auth/login` → `routes/auth.js` → `authController.login` → query PostgreSQL → `authService.comparePassword` → `authService.generateToken` → return JWT

**Protected route:** Request → `middleware/auth.js` → `authService.verifyToken` → attaches `req.userId` → controller

## URL Flow

**Shorten:** `POST /api/url/` → `middleware/auth.js` → `routes/url.js` → `urlController.shortenUrl` → validate URL → `urlService.createShortUrl` → `shortCode.getNanoid` → collision check in PostgreSQL → insert into PostgreSQL → return short code

**Redirect:** `GET /:code` → `routes/redirect.js` → `redirectController.redirect` → `redirectService.getOriginalUrl` → check Redis cache → if miss, query PostgreSQL → store in Redis (TTL 1hr) → 302 redirect
