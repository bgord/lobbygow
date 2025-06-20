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
./bgord-scripts/bun-local-server-start.sh
```

Run the tests

```
./bgord-scripts/bun-test-run.sh
```

## Domain:

```
modules/
└── mailer
    ├── routes
    │   └── notification-send.ts
    ├── services
    │   ├── notification-composer.ts
    │   └── notification.ts
    └── value-objects
        ├── notification-kind-enum.ts
        └── notification-kind.ts
```

## Infra:

```
infra/
├── api-key-shield.ts
├── basic-auth-shield.ts
├── env.ts
├── healthcheck.ts
├── i18n.ts
├── logger.ts
├── mailer.ts
└── prerequisites.ts
```
