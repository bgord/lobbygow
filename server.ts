import * as bg from "@bgord/bun";
import type * as tools from "@bgord/tools";
import { Hono } from "hono";
import type * as infra from "+infra";
import type { bootstrap } from "+infra/bootstrap";
import * as RateLimiters from "+infra/rate-limiters";
import * as App from "./app";

export function createServer(di: Awaited<ReturnType<typeof bootstrap>>) {
  type HonoConfig = { Variables: infra.Variables; startup: tools.Stopwatch };

  const server = new Hono<HonoConfig>()
    .basePath("/api")
    .use(...bg.Setup.essentials({ ...di.Adapters.System, I18n: di.Tools.I18nConfig }));

  // Healthcheck =================
  server.get(
    "/healthcheck",
    new bg.ShieldRateLimitAdapter(
      {
        enabled: di.Env.type === bg.NodeEnvironmentEnum.production,
        subject: bg.AnonSubjectResolver,
        store: RateLimiters.HealthcheckStore,
      },
      di.Adapters.System,
    ).verify,
    di.Adapters.System.ShieldTimeout.verify,
    di.Adapters.System.ShieldBasicAuth.verify,
    ...bg.Healthcheck.build(di.Tools.prerequisites, di.Adapters.System),
  );
  // =============================

  // Mailer =================
  server.post(
    "/notification-send",
    new bg.ShieldRateLimitAdapter(
      {
        enabled: di.Env.type === bg.NodeEnvironmentEnum.production,
        subject: bg.AnonSubjectResolver,
        store: RateLimiters.NotificationSendStore,
      },
      di.Adapters.System,
    ).verify,
    di.Adapters.System.ShieldTimeout.verify,
    di.Adapters.System.ShieldApiKey.verify,
    App.Http.Mailer.NotificationSend(di),
  );
  // =============================

  server.onError(App.Http.ErrorHandler.handle(di.Adapters.System));

  return server;
}
