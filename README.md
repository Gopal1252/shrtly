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
