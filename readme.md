# lobbygow

[Check status](https://bgord.github.io/statuses/history/lobbygow)

## Configuration:

Clone the repository

```
git clone git@github.com:bgord/journal.git --recurse-submodules
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
├── basic-auth-shield.ts
├── env.ts
├── healthcheck.ts
├── i18n.ts
├── logger.adapter.ts
├── mailer.adapter.ts
├── prerequisites.ts
├── rate-limiters.ts
└── shield-api-key.ts
```
