---
title: Run Standard on your machine
description: Install the pinned toolchain, start the local services, and sign in to the app with a seeded account in about ten minutes.
publishedAt: 2026-10-21
tags:
  - getting-started
---

Standard runs as an API, a web app and this landing page, backed by Postgres, Redis, RabbitMQ, a mail catcher and an S3 compatible object store. Docker runs the services; the three apps run on your machine so they reload as you edit them.

## Install the toolchain

`.prototools` pins every tool the workspace uses, proto included: Node 24, pnpm 11 and moon. With [proto](https://moonrepo.dev/proto) installed, one command checks its version and installs the workspace:

```sh
make install
```

If proto is older than the pin, `make install` stops and names the version to upgrade to. Node 24 and pnpm 11 on your `PATH` work too, without proto.

## Configure the apps

Each app reads its own `.env`, and the example files already match the services Docker starts:

```sh
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

`apps/api/.env.example` is the full list of variables the API accepts. The API checks them at boot and refuses to start on a missing or malformed one, so a typo surfaces before the first request rather than during it.

## Start the services and the apps

```sh
make setup   # start the services, migrate and seed
make up      # start the API and the web together
```

`make setup` starts the containers, applies the migrations and seeds three users. `make up` then runs the API and the web in one terminal. To run them one at a time, use `make api`, `make web` and `make landing` in separate terminals.

| What | Where |
|---|---|
| The app | `http://localhost:5173/app/` |
| The API | `http://localhost:3001` |
| This landing page | `http://localhost:4321`, with `/app` passed through to the app |
| Mail sent in development | `http://localhost:8025` |

## Sign in

The seed creates three accounts, all with the password `Password123`:

- `admin@test.app`, who can manage users and roles
- `member@test.app`, who can create, read and update notes
- `viewer@test.app`, who can only read notes

A new account confirms its email before it can sign in, so open the confirmation link from the mail catcher. That seed password is the default outside production only: with `NODE_ENV=production` the seed refuses to run unless `SEED_PASSWORD` is set, and then it creates the admin alone.

## Check what is running

Every change to the repository bumps the version in the root `package.json`, and both sides report it:

```sh
curl -s http://localhost:3001/api/health
```

The app shows its own version next to the API's at `/app/health`, so two different numbers there mean the two were started from different checkouts.

## Next

With the stack running, the next step is usually a feature of your own. [Add a module](/blog/adding-a-module/) walks through every file a new one touches.
