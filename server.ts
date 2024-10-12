import * as bg from "@bgord/node";
import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { bodyLimit } from "hono/body-limit";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { requestId } from "hono/request-id";
import { timing } from "hono/timing";
import { timeout } from "hono/timeout";

import * as infra from "./infra";
import * as App from "./app";
import * as Mailer from "./modules/mailer";

type Env = {
  Variables: infra.Variables;
  startup: bg.Stopwatch;
};

const server = new Hono<Env>();

server.use(secureHeaders());
server.use(bodyLimit({ maxSize: infra.BODY_LIMIT_MAX_SIZE }));
server.use(bg.Bun.ApiVersion.attach);
server.use(cors({ origin: "*" }));
server.use(requestId());
server.use(bg.Bun.TimeZoneOffset.attach);
server.use(bg.Bun.Context.attach);
server.use(bg.Bun.WeakETagExtractor.attach);
server.use(bg.Bun.ETagExtractor.attach);
server.use(bg.Bun.HttpLogger.build(infra.logger));
server.use(timing());

server.use("*", serveStatic({ root: "./static/" }));

const startup = new bg.Stopwatch();

// Healthcheck =================
server.get(
  "/healthcheck",
  bg.Bun.rateLimitShield(bg.Time.Seconds(5)),
  timeout(bg.Time.Seconds(15).ms, infra.requestTimeoutError),
  infra.BasicAuthShield,
  ...bg.Bun.Healthcheck.build(infra.healthcheck),
);
// =============================

// Mailer =================
server.post(
  "/notification-send",
  bg.Bun.rateLimitShield(bg.Time.Seconds(5)),
  timeout(bg.Time.Seconds(15).ms, infra.requestTimeoutError),
  infra.ApiKeyShield.verify,
  Mailer.Routes.NotificationSend,
);
// =============================

server.onError(App.Routes.ErrorHandler.handle);

export { server, startup };
