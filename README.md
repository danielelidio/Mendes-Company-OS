# mendescompany-os

Monorepo with a NestJS back-end and an Expo + Electron desktop app, orchestrated via Docker Compose with live reload.

## Layout

```
.
├── back-end/        NestJS API (Docker, live reload via `start:dev`)
├── app/             Expo app (web served by Metro in Docker, Electron runs on host)
├── scripts/         dev/stop helpers
├── docker-compose.yml
└── README.md
```

## Requirements

- Node.js 20+
- Docker Desktop 24+
- macOS / Linux / Windows (Electron runs on the host)

## Quick start

```bash
./scripts/dev.sh
```

This will:
1. `docker compose up --build` — boot NestJS (`:3002`) and Expo web (`:8082`) with file watching.
2. Wait for Expo web to be reachable.
3. Launch Electron on the host, pointing at `http://localhost:8082`.

## Access points

| Surface       | URL / command                                |
|---------------|----------------------------------------------|
| Back-end API  | http://localhost:3002                        |
| App (browser) | http://localhost:8082                        |
| App (Electron)| `npm --prefix app run electron:dev` on host  |

The browser and Electron load the **same** Metro bundle, so HMR/live reload works in both places at once.

## Stack only (no Electron)

If you just want the API + browser-rendered app:

```bash
docker compose up --build
```

Then open http://localhost:8082.

Stop everything:

```bash
./scripts/stop.sh
```

## Live reload

| Service     | Mechanism                                                |
|-------------|----------------------------------------------------------|
| NestJS      | `nest start --watch` inside the container, volume mount  |
| Expo web    | Metro HMR inside the container, volume mount             |
| Electron    | `electron-reload` watches `app/electron/` on the host    |

Polling (`CHOKIDAR_USEPOLLING=true`) is enabled inside containers so that file-watching survives the Docker bind-mount layer on macOS/Windows.

## Why Electron on the host?

Electron is a desktop GUI app and needs access to the host's window server. Running it in Docker is impractical for a dev loop. The Docker side serves the web bundle (the renderer); Electron on the host loads that URL.
