import * as bg from "@bgord/bun";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { serveStatic } from "hono/bun";
import { cors } from "hono/cors";
import { requestId } from "hono/request-id";
import { secureHeaders } from "hono/secure-headers";
import { timeout } from "hono/timeout";
import { timing } from "hono/timing";
import * as App from "./app";
import * as infra from "./infra";
import * as Mailer from "./modules/mailer";

type Env = { Variables: infra.Variables; startup: tools.Stopwatch };

const server = new Hono<Env>();

server.use(secureHeaders());
server.use(bodyLimit({ maxSize: infra.BODY_LIMIT_MAX_SIZE }));
server.use(bg.ApiVersion.attach);
server.use(cors({ origin: "*" }));
server.use(requestId());
server.use(bg.TimeZoneOffset.attach);
server.use(bg.Context.attach);
server.use(bg.WeakETagExtractor.attach);
server.use(bg.ETagExtractor.attach);
server.use(bg.HttpLogger.build(infra.logger));
server.use(timing());

server.use("*", serveStatic({ root: "./static/" }));

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
