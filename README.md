# Mixtape Matchmaker v2

## Description

Mixtape Matchmaker v2 is a modern overhaul of the original Mixtape Matchmaker client, now powered by React 19, TypeScript, Vite, Material UI (MUI) v5, and React Router v6.

This client interfaces with the Mixtape Matchmaker backend to provide users with a platform to create customizable playlists, discover new music, and match with other users who share similar musical tastes.

## Requirements

* NodeJS and npm
  - On Mac
  ```bash
  brew update
  brew install node
  ```
  - On Ubuntu
  ```bash
  sudo apt update
  sudo apt install nodejs
  ```
  - On Windows, download from https://nodejs.org/en/download/

## Installation

```bash
cd mixtape-matchmaker-v2
npm install
```

## Running the App

To start the development server, run:

```bash
npm start
```

This will launch Vite's fast development server. You can access the application at `http://localhost:5173` by default.

## Running the v2 API

The v2 server lives in `server/` and uses SQL migrations instead of the old MongoDB models.

```bash
npm run server:install
cp server/.env.example server/.env
npm run server:migrate
npm run server:dev
```

By default `DATABASE_URL=sqlite://./data/mixtape-matchmaker.sqlite`, which creates a local SQLite database under `server/data/`.

To run against MySQL, set `DATABASE_URL` in `server/.env`:

```bash
DATABASE_URL=mysql://user:password@localhost:3306/mixtape_matchmaker
```

Then run the same migration command:

```bash
npm run server:migrate
```

The server also runs migrations on startup unless `RUN_MIGRATIONS=false`.
