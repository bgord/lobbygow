import * as bg from "@bgord/bun";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { timeout } from "hono/timeout";
import * as infra from "+infra";
import { Clock } from "+infra/clock.adapter";
import { Env } from "+infra/env";
import { healthcheck } from "+infra/healthcheck";
import { I18nConfig } from "+infra/i18n";
import { IdProvider } from "+infra/id-provider";
import { JsonFileReader } from "+infra/json-file-reader.adapter";
import { Logger } from "+infra/logger.adapter";
import * as RateLimiters from "+infra/rate-limiters";
import { ShieldApiKey } from "+infra/shield-api-key";
import { ShieldBasicAuth } from "+infra/shield-basic-auth";
import * as App from "./app";

const ShieldRateLimitDeps = { Clock };
const HealthcheckDeps = { Clock, JsonFileReader, Logger };
const ServerDeps = { Logger, I18n: I18nConfig, Clock, IdProvider, JsonFileReader };

type HonoConfig = { Variables: infra.Variables; startup: tools.Stopwatch };

const server = new Hono<HonoConfig>();

server.use(...bg.Setup.essentials(ServerDeps));

const startup = new tools.Stopwatch(Clock.now());

// Healthcheck =================
server.get(
  "/healthcheck",
  bg.ShieldRateLimit(
    {
      enabled: Env.type === bg.NodeEnvironmentEnum.production,
      subject: bg.AnonSubjectResolver,
      store: RateLimiters.HealthcheckStore,
    },
    ShieldRateLimitDeps,
  ),
  timeout(tools.Duration.Seconds(15).ms, infra.requestTimeoutError),
  ShieldBasicAuth,
  ...bg.Healthcheck.build(healthcheck, HealthcheckDeps),
);
// =============================

// Mailer =================
server.post(
  "/notification-send",
  bg.ShieldRateLimit(
    {
      enabled: Env.type === bg.NodeEnvironmentEnum.production,
      subject: bg.AnonSubjectResolver,
      store: RateLimiters.NotificationSendStore,
    },
    ShieldRateLimitDeps,
  ),
  timeout(tools.Duration.Seconds(15).ms, infra.requestTimeoutError),
  ShieldApiKey.verify,
  App.Http.Mailer.NotificationSend,
);
// =============================

server.onError(App.Http.ErrorHandler.handle);

export { server, startup };
