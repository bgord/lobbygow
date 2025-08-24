import * as bg from "@bgord/bun";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { timeout } from "hono/timeout";
import * as infra from "+infra";
import { Env } from "+infra/env";
import { healthcheck } from "+infra/healthcheck";
import { I18nConfig } from "+infra/i18n";
import { logger } from "+infra/logger.adapter";
import * as RateLimiters from "+infra/rate-limiters";
import { ShieldApiKey } from "+infra/shield-api-key";
import { ShieldBasicAuth } from "+infra/shield-basic-auth";
import * as App from "./app";

type HonoConfig = { Variables: infra.Variables; startup: tools.Stopwatch };

const server = new Hono<HonoConfig>();

server.use(...bg.Setup.essentials(logger, I18nConfig));

const startup = new tools.Stopwatch();

// Healthcheck =================
server.get(
  "/healthcheck",
  bg.ShieldRateLimit({
    enabled: Env.type === bg.NodeEnvironmentEnum.production,
    subject: bg.AnonSubjectResolver,
    store: RateLimiters.HealthcheckStore,
  }),
  timeout(tools.Time.Seconds(15).ms, infra.requestTimeoutError),
  ShieldBasicAuth,
  ...bg.Healthcheck.build(healthcheck),
);
// =============================

// Mailer =================
server.post(
  "/notification-send",
  bg.ShieldRateLimit({
    enabled: Env.type === bg.NodeEnvironmentEnum.production,
    subject: bg.AnonSubjectResolver,
    store: RateLimiters.NotificationSendStore,
  }),
  timeout(tools.Time.Seconds(15).ms, infra.requestTimeoutError),
  ShieldApiKey.verify,
  App.Http.Mailer.NotificationSend,
);
// =============================

server.onError(App.Http.ErrorHandler.handle);

export { server, startup };
