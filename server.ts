import * as bgn from "@bgord/node";
import * as bgb from "@bgord/bun";
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
  startup: bgn.Stopwatch;
};

const server = new Hono<Env>();

server.use(secureHeaders());
server.use(bodyLimit({ maxSize: infra.BODY_LIMIT_MAX_SIZE }));
server.use(bgb.ApiVersion.attach);
server.use(cors({ origin: "*" }));
server.use(requestId());
server.use(bgb.TimeZoneOffset.attach);
server.use(bgb.Context.attach);
server.use(bgb.WeakETagExtractor.attach);
server.use(bgb.ETagExtractor.attach);
server.use(bgb.HttpLogger.build(infra.logger));
server.use(timing());

server.use("*", serveStatic({ root: "./static/" }));

const startup = new bgn.Stopwatch();

// Healthcheck =================
server.get(
  "/healthcheck",
  bgb.rateLimitShield(bgn.Time.Seconds(5)),
  timeout(bgn.Time.Seconds(15).ms, infra.requestTimeoutError),
  infra.BasicAuthShield,
  ...bgb.Healthcheck.build(infra.healthcheck),
);
// =============================

// Mailer =================
server.post(
  "/notification-send",
  bgb.rateLimitShield(bgn.Time.Seconds(5)),
  timeout(bgn.Time.Seconds(15).ms, infra.requestTimeoutError),
  infra.ApiKeyShield.verify,
  Mailer.Routes.NotificationSend,
);
// =============================

server.onError(App.Routes.ErrorHandler.handle);

export { server, startup };
