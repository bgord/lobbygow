import * as bg from "@bgord/bun";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { timeout } from "hono/timeout";
import * as infra from "+infra";
import type { bootstrap } from "+infra/bootstrap";
import * as RateLimiters from "+infra/rate-limiters";
import * as App from "./app";

export function createServer(di: Awaited<ReturnType<typeof bootstrap>>) {
  type HonoConfig = { Variables: infra.Variables; startup: tools.Stopwatch };

  const server = new Hono<HonoConfig>().basePath("/api");

  server.use(...bg.Setup.essentials({ ...di.Adapters.System, I18n: di.Tools.I18nConfig }));

  const startup = new tools.Stopwatch(di.Adapters.System.Clock.now());

  // Healthcheck =================
  server.get(
    "/healthcheck",
    bg.ShieldRateLimit(
      {
        enabled: di.Env.type === bg.NodeEnvironmentEnum.production,
        subject: bg.AnonSubjectResolver,
        store: RateLimiters.HealthcheckStore,
      },
      di.Adapters.System,
    ),
    timeout(tools.Duration.Seconds(15).ms, infra.requestTimeoutError),
    di.Tools.ShieldBasicAuth,
    ...bg.Healthcheck.build(di.Tools.healthcheck, di.Adapters.System),
  );
  // =============================

  // Mailer =================
  server.post(
    "/notification-send",
    bg.ShieldRateLimit(
      {
        enabled: di.Env.type === bg.NodeEnvironmentEnum.production,
        subject: bg.AnonSubjectResolver,
        store: RateLimiters.NotificationSendStore,
      },
      di.Adapters.System,
    ),
    timeout(tools.Duration.Seconds(15).ms, infra.requestTimeoutError),
    di.Tools.ShieldApiKey.verify,
    App.Http.Mailer.NotificationSend(di),
  );
  // =============================

  server.onError(App.Http.ErrorHandler.handle(di.Adapters.System));

  return { server, startup };
}
