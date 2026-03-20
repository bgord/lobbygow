import * as bg from "@bgord/bun";
import { Hono } from "hono";
import type * as infra from "+infra";
import { languages } from "+languages";
import type { bootstrap } from "+infra/bootstrap";
import * as App from "./app";

export function createServer(di: Awaited<ReturnType<typeof bootstrap>>) {
  const HashContent = new bg.HashContentSha256Strategy();
  const CacheRepository = new bg.CacheRepositoryNodeCacheAdapter({ type: "infinite" });
  const CacheResolver = new bg.CacheResolverSimpleStrategy({ CacheRepository });

  const server = new Hono<infra.Config>()
    .basePath("/api")
    .use(
      ...bg.SetupHono.essentials(
        { csrf: { origin: [] }, I18n: { languages, strategies: [] } },
        { ...di.Adapters.System, ...di.Tools, HashContent, CacheResolver },
      ),
    )
    .use(di.Tools.ShieldSecurity.handle());

  // Probes =================
  server.get("/liveness", ...new bg.LivenessHonoHandler().handle());
  server.get(
    "/readiness",
    di.Tools.ShieldTimeout.handle(),
    ...new bg.ReadinessHonoHandler({ prerequisites: [] }).handle(),
  );
  server.get(
    "/healthcheck",
    di.Tools.ShieldRateLimit.handle(),
    di.Tools.ShieldTimeout.handle(),
    di.Tools.ShieldBasicAuth.handle(),
    ...new bg.HealthcheckHonoHandler(
      { Env: di.Env.type, prerequisites: di.Tools.Prerequisites },
      { ...di.Adapters.System, ...di.Tools, LoggerStatsProvider: di.Adapters.System.Logger },
    ).handle(),
  );
  // =============================

  // Mailer =================
  server.post(
    "/notification-send",
    di.Tools.ShieldRateLimit.handle(),
    di.Tools.ShieldTimeout.handle(),
    di.Tools.ShieldApiKey.handle(),
    App.Http.Mailer.NotificationSend(di),
  );
  // =============================

  server.onError(App.Http.ErrorHandler.handle(di.Adapters.System));

  return server;
}
