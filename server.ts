import * as bg from "@bgord/bun";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { timeout } from "hono/timeout";
import * as App from "./app";
import * as infra from "./infra";
import * as Mailer from "./modules/mailer";

type Env = { Variables: infra.Variables; startup: tools.Stopwatch };

const server = new Hono<Env>();

server.use(...bg.Setup.essentials(infra.logger, infra.I18nConfig));

const startup = new tools.Stopwatch();

// Healthcheck =================
server.get(
  "/healthcheck",
  bg.rateLimitShield(tools.Time.Seconds(5)),
  timeout(tools.Time.Seconds(15).ms, infra.requestTimeoutError),
  infra.BasicAuthShield,
  ...bg.Healthcheck.build(infra.healthcheck),
);
// =============================

// Mailer =================
server.post(
  "/notification-send",
  bg.rateLimitShield(tools.Time.Seconds(5)),
  timeout(tools.Time.Seconds(15).ms, infra.requestTimeoutError),
  infra.ApiKeyShield.verify,
  Mailer.Routes.NotificationSend,
);
// =============================

server.onError(App.Routes.ErrorHandler.handle);

export { server, startup };
