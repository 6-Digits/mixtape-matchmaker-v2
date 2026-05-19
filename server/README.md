# Mixtape Matchmaker v2 Server

Clean Express + Socket.IO API for Mixtape Matchmaker v2.

## Database

The server uses Knex migrations and chooses the database driver from `DATABASE_URL`.

SQLite, the default:

```bash
DATABASE_URL=sqlite://./data/mixtape-matchmaker.sqlite
```

MySQL:

```bash
DATABASE_URL=mysql://user:password@localhost:3306/mixtape_matchmaker
```

Migration workflow is the same for both:

```bash
npm run migrate
```

Rollback the latest batch:

```bash
npm run migrate:rollback
```

Create a new migration:

```bash
npm run migrate:make add_feature_name
```

## Development

```bash
npm install
cp .env.example .env
npm run migrate
npm run dev
```

Useful routes:

- `GET /health`
- `POST /account/register`
- `POST /account/login`
- `GET /profile/me`
- `GET /mixtapes`
- `GET /matches`
- `GET /matches/chats`
