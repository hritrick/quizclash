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
| 9 | **CI/CD** | GitHub Actions workflows for backend testing (`ci.yml`), Render deploy (`deploy-server.yml`), and Vercel deploy (`deploy-client.yml`) |
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
npm run install:all
```

### 3. Start MongoDB (via Docker)
```bash
docker compose up -d mongo
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

## 👥 Demo Accounts (Seeded)

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
- Role guard authorization (player restricted from creating quizzes; host permitted)

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
docker compose up --build
```
Access the client at `http://localhost:5173` and backend at `http://localhost:5000`.

---

## 📜 License
MIT
