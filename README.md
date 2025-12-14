# Madoguchi

Next.js 16 + LiveKit + Drizzle ORM + TiDB を使用したオンライン窓口システム。

## Tech Stack

- **Framework**: Next.js 16
- **Database**: TiDB (さくらのクラウド エンハンスドDB)
- **ORM**: Drizzle ORM
- **Video**: LiveKit
- **Styling**: Tailwind CSS

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

Required variables:

- `LIVEKIT_API_KEY` - LiveKit API key
- `LIVEKIT_API_SECRET` - LiveKit API secret
- `NEXT_PUBLIC_LIVEKIT_URL` - LiveKit server URL
- `DATABASE_URL` - TiDB connection string

### 3. Push database schema

```bash
npm run db:push
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Available Scripts

| Script        | Description                  |
| ------------- | ---------------------------- |
| `dev`         | Start development server     |
| `build`       | Build for production         |
| `start`       | Start production server      |
| `lint`        | Run ESLint                   |
| `format`      | Format code with Prettier    |
| `db:generate` | Generate database migrations |
| `db:migrate`  | Run database migrations      |
| `db:push`     | Push schema to database      |
| `db:studio`   | Open Drizzle Studio          |

## Pages

- `/` - Home page
- `/demo` - Drizzle + TiDB demo (messages)
- `/rooms/[roomName]` - LiveKit video room

## API Endpoints

- `GET /api/health` - Database health check
- `GET /api/messages` - Get all messages
- `POST /api/messages` - Create a message
- `GET /api/token` - Get LiveKit token
