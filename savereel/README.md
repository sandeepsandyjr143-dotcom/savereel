# SaveReel v3.0

Download YouTube videos and Instagram reels. Free, fast, no watermarks.

## Stack

- **Server**: Node.js + Express (ESM strict mode)
- **Client**: React 18 + Vite + React Router v6
- **Styling**: CSS Modules

## Structure

```
savereel/
├── server/          # Express API
│   ├── app.js
│   ├── app.test.js
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── providers/     ← YouTube + Instagram (with retry)
│       ├── routes/
│       ├── utils/         ← errors, logger, helpers, analytics
│       └── validators/
└── client/          # React frontend
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── App.jsx
        ├── components/
        ├── hooks/
        ├── pages/         ← Home, Privacy, Terms, DMCA
        ├── services/
        └── utils/
```

## Quick Start

### Server
```bash
cd server
cp .env.example .env    # fill in values
npm install
npm run dev             # http://localhost:3001
```

### Client
```bash
cd client
npm install
npm run dev             # http://localhost:5173
```

## Environment Variables (server/.env)

| Variable       | Required     | Description                        |
|----------------|--------------|------------------------------------|
| NODE_ENV       | Yes          | `development` or `production`      |
| PORT           | No           | Default: 3001                      |
| CLIENT_URL     | Prod only    | Frontend URL for CORS              |
| HEALTH_SECRET  | Recommended  | Protects /health/details + /health/analytics |

## API Routes

| Method | Route               | Description                     |
|--------|---------------------|---------------------------------|
| GET    | /health             | Public uptime check             |
| GET    | /health/details     | Detailed stats (secret required)|
| GET    | /health/analytics   | Usage stats (secret required)   |
| GET    | /api/yt/info        | YouTube video metadata          |
| GET    | /api/yt/download    | Stream YouTube video            |
| GET    | /api/ig/info        | Instagram reel metadata         |
| GET    | /api/ig/download    | Proxy Instagram stream          |

## Running Tests

```bash
cd server
npm test
```

## Deploy (Render / Railway / Fly.io)

**Server**: Set env vars, run `npm start`. Node 18+ required.

**Client**: Run `npm run build`, deploy the `dist/` folder to Vercel/Netlify/Cloudflare Pages. Set `VITE_API_URL` to your server URL.

## What's New in v3.0

- Retry logic on all provider calls (1 retry with delay)
- Real download error detection (HEAD check before triggering)
- In-memory analytics at `/health/analytics`
- Legal pages: Privacy Policy, Terms of Service, DMCA Notice
- React Router — proper page navigation
- Footer with legal links
- Missing client entry files added: App.jsx, main.jsx, index.html, vite.config.js
