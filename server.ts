import * as bg from "@bgord/bun";
import { Hono } from "hono";
import type * as infra from "+infra";
import type { bootstrap } from "+infra/bootstrap";
import * as App from "./app";

export function createServer(di: Awaited<ReturnType<typeof bootstrap>>) {
  const server = new Hono<infra.Config>()
    .basePath("/api")
    .use(...bg.Setup.essentials({ ...di.Adapters.System, I18n: di.Tools.I18nConfig }));

  // Healthcheck =================
  server.get(
    "/healthcheck",
    di.Adapters.System.ShieldRateLimit.verify,
    di.Adapters.System.ShieldTimeout.verify,
    di.Adapters.System.ShieldBasicAuth.verify,
    ...bg.Healthcheck.build(di.Env.type, di.Tools.prerequisites, di.Adapters.System),
  );
  // =============================

  // Mailer =================
  server.post(
    "/notification-send",
    di.Adapters.System.ShieldRateLimit.verify,
    di.Adapters.System.ShieldTimeout.verify,
    di.Adapters.System.ShieldApiKey.verify,
    App.Http.Mailer.NotificationSend(di),
  );
  // =============================

  server.onError(App.Http.ErrorHandler.handle(di.Adapters.System));

  return server;
}
