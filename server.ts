import * as bg from "@bgord/bun";
import { Hono } from "hono";
import type * as infra from "+infra";
import type { bootstrap } from "+infra/bootstrap";
import * as App from "./app";

export function createServer(di: Awaited<ReturnType<typeof bootstrap>>) {
  const HashContent = new bg.HashContentSha256Strategy();
  const CacheRepository = new bg.CacheRepositoryNodeCacheAdapter({ type: "infinite" });
  const CacheResolver = new bg.CacheResolverSimpleStrategy({ CacheRepository });

  const server = new Hono<infra.Config>()
    .basePath("/api")
    .use(
      ...bg.Setup.essentials(
        { csrf: { origin: [] } },
        { ...di.Adapters.System, ...di.Tools, HashContent, CacheResolver },
      ),
    )
    .use(di.Tools.ShieldSecurity.verify);

  // Healthcheck =================
  server.get(
    "/healthcheck",
    di.Tools.ShieldRateLimit.verify,
    di.Tools.ShieldTimeout.verify,
    di.Tools.ShieldBasicAuth.verify,
    ...bg.Healthcheck.build(
      { Env: di.Env.type, prerequisites: di.Tools.Prerequisites },
      { ...di.Adapters.System, ...di.Tools },
    ),
  );
  // =============================

  // Mailer =================
  server.post(
    "/notification-send",
    di.Tools.ShieldRateLimit.verify,
    di.Tools.ShieldTimeout.verify,
    di.Tools.ShieldApiKey.verify,
    App.Http.Mailer.NotificationSend(di),
  );
  // =============================

  server.onError(App.Http.ErrorHandler.handle(di.Adapters.System));

  return server;
}
