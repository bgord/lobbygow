# lobbygow

[![Deploy](https://github.com/bgord/lobbygow/actions/workflows/deploy-server.yml/badge.svg)](https://github.com/bgord/lobbygow/actions/workflows/deploy-server.yml)

[![Healthcheck](https://github.com/bgord/lobbygow/actions/workflows/healthcheck.yml/badge.svg)](https://github.com/bgord/lobbygow/actions/workflows/healthcheck.yml)

[Check status](https://bgord.github.io/statuses/history/lobbygow)

## Configuration:

Clone the repository

```
git clone git@github.com:bgord/lobbygow.git --recurse-submodules
```

Install packages

```
bun i
```

Create env files

```
cp .env.example .env.local
cp .env.example .env.test
```

Start the app

```
./bgord-scripts/local-server-start.sh
```

Run the tests

```
./bgord-scripts/test-run.sh
```

## Domain:

```
modules/
└── notifier
    ├── services
    │   ├── notification-composer.ts
    │   └── notification.ts
    └── value-objects
        ├── notification-kind-enum.ts
        └── notification-kind.ts
```

## App:

```
app/
├── http
│   ├── error-handler.ts
│   └── mailer
│       └── notification-send.ts
```

## Infra:

```
infra/
├── bootstrap.ts
├── env.ts
├── i18n.ts
└── rate-limiters.ts
```
