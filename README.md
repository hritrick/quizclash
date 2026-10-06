# ⚡ QuizClash — Multiplayer GK Pub Quiz App

A high-intensity, full-stack real-time multiplayer General Knowledge quiz platform engineered with a distinct **"game-show / pub quiz" aesthetic**. Built with tactile buzzers, server-authoritative speed-decay scoring, dirty tactical power-ups, spectator streaming, and comprehensive admin analytics.

---

## 📸 Architecture & Experiment Mapping

```
                    ┌─────────────────────────┐
                    │     React (Vite) SPA    │  Vercel / Nginx
                    │  Tailwind + RTK + Audio │
                    └────────────┬────────────┘
                     REST (axios)│   WebSocket (socket.io-client)
                                 ▼   ▼
                    ┌─────────────────────────┐
                    │   Node.js + Express     │  Render / Docker
                    │  Socket.io Game Engine  │
                    │  JWT Auth & Role Guards │
                    └────────────┬────────────┘
                                 │ Mongoose
                                 ▼
                    ┌─────────────────────────┐
                    │      MongoDB Atlas      │
                    └─────────────────────────┘
```

| # | Technology / Feature | Implementation in QuizClash |
|---|---|---|
| 1 | **Tailwind CSS** | Custom design tokens: Warm cream (`#FBF6EE`), Deep ink (`#14110F`), Amber (`#F2A93B`), Coral (`#FF5A4E`), Teal (`#1F8A70`), tactile buzzer boards |
| 2 | **React Hooks** | `useQuizSocket`, `useCountdown`, `useAuth`, `useEffect`, `useContext`, `useCallback` |
| 3 | **State Management** | **Redux Toolkit** for high-frequency game/room socket state (`roomSlice`, `gameSlice`) + **Context API** for auth & profile |
| 4 | **REST API + Mongoose** | Full CRUD for Users, Quizzes, Questions, Rooms, Leaderboards, Match Histories |
| 5 | **Secure APIs** | Helmet, rate-limiting, Zod input validation schemas, centralized error handler, strict CORS |
| 6 | **JWT Auth & Roles** | `player`, `host`, `admin` roles; access token (15m) + httpOnly refresh token cookie with automatic token rotation |
| 7 | **Postman Collection** | Complete collection + environment with automated `pm.test` assertions & token capturing |
| 8 | **WebSockets (Socket.io)** | Real-time lobbies, countdown sync, live buzzer answers, power-ups, spectator mode |
| 9 | **CI/CD** | GitHub Actions tests, frontend build and Docker builds; native Git deployments to Render/Vercel followed by database, revision, REST and socket readiness checks |
| 10 | **Docker & DevOps** | Multi-stage Dockerfiles for client (Nginx) & server, plus `docker-compose.yml` |

---

## 🎮 Real-Time Gameplay & Power-Ups

- **Server-Authoritative Speed Scoring**:
  $$\text{points} = \text{basePoints} \times \max\left(0, 1 - \frac{\text{answerTimeMs}}{\text{timeLimitMs}} \times 0.5\right)$$
  Faster correct answers award up to 100% points; answers right before buzzer award 50%; incorrect answers award 0.
- **Tactical Power-Ups**:
  - **`50:50`**: Server removes 2 incorrect options so client never receives them.
  - **`2x Multiplier`**: Doubles round score if answered correctly.
  - **`Freeze Rival`**: Freezes top opponent's buzzers for 4 seconds with icy visual overlay and server lock.
- **Solo Practice Mode**: Instant single-player run against the clock.
- **Audience Spectator Mode**: Join live matches as an observer with real-time scoreboards.

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Node.js >= 18
- MongoDB running locally OR Docker installed

### 2. Install Dependencies
From the repository root:
```bash
npm ci
```

Copy `server/.env.example` to `server/.env`. Its defaults are for development only.

### 3. Start MongoDB (via Docker)
```bash
docker run -d --name quizclash-mongo -p 27017:27017 mongo:7
```

### 4. Seed Database with Quizzes & Users
```bash
npm --prefix server run seed
```

### 5. Run Client & Server Concurrently
```bash
npm run dev
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

---

## 👥 Demo Accounts (Local fixtures only)

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@quizclash.com` | `password123` |
| **Host** | `host@quizclash.com` | `password123` |
| **Player** | `alex@quizclash.com` | `password123` |

---

## 🧪 Automated Testing

### Backend Unit & Integration Tests (Jest + MongoMemoryServer)
```bash
npm test
```
Verifies:
- Time-weighted scoring algorithm & multipliers
- Registration, login, JWT validation, and token refresh
- Public registration cannot create admins; host signup remains supported
- Answer redaction, question ownership, private production signing keys
- One-time refresh rotation, including simultaneous replay
- Real socket solo startup, multiplayer scoring, reconnect, spectator and all power-ups

---

## 📮 Postman API Validation

1. Import `postman/QuizClash.postman_collection.json` and `postman/QuizClash.postman_environment.json` into Postman.
2. Select the **QuizClash Local Dev** environment.
3. Run the collection. Automated test scripts verify HTTP response codes, response structure, token chaining, and 403 role rejections.

To run via Newman CLI:
```bash
npx newman run postman/QuizClash.postman_collection.json -e postman/QuizClash.postman_environment.json
```

---

## 🐳 Docker Deployment

To launch the full stack locally in containers:
```bash
JWT_SECRET=<private-32+-character-key> JWT_REFRESH_SECRET=<different-private-key> COOKIE_SECRET=<private-key> docker compose up --build
```
Access the client at `http://localhost:5173` and backend at `http://localhost:5000`.

---

## Production configuration

The Vercel frontend proxies `/api/*` to `https://quizclash-06yc.onrender.com` so refresh cookies remain on the frontend origin. WebSocket traffic connects directly to Render using `client/.env.production`. This follows [Vercel external-origin routing](https://vercel.com/docs/routing/rewrites).

Render uses branch `main`, build command `npm ci --omit=dev --workspace server`, start command `node server/src/server.js`, and health check `/health`. Configure these environment variables securely on Render:

- `NODE_ENV=production`
- `MONGO_URI`: MongoDB Atlas connection string for the application's database
- `JWT_SECRET` and `JWT_REFRESH_SECRET`: different private random values, each at least 32 characters
- `COOKIE_SECRET`: private random value
- `CLIENT_URL=https://quizclash-eta.vercel.app`

Production fails startup when signing keys are missing or use the public development examples. No server secrets belong in `VITE_*` variables. Configure Atlas networking to permit the Render service's outbound addresses. Do not run the development seed against an existing production database: it deletes all collections and installs publicly known demo passwords. Create production admin accounts through a trusted provisioning process; public signup offers player or host only.

Pushes to `main` trigger the existing Git integrations. GitHub Actions verifies the deployed commit and backend readiness after CI succeeds. Verification fails when configuration or deployment is missing. The realtime engine runs in one Node process; horizontally scaling it requires shared game state and a Socket.IO adapter, and active rounds currently do not survive process restarts.

For isolated browser or Postman verification without touching Atlas:

```bash
node scripts/dev-test-server.mjs
# In a separate terminal
npm run dev:client
```

This fixture starts an ephemeral seeded MongoDB database and an API on `127.0.0.1:5000`. Stop it after testing.

## 📜 License
MIT
