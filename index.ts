import * as bg from "@bgord/bun";
import { BODY_LIMIT_MAX_SIZE } from "+infra";
import { Env } from "+infra/env";
import { Logger } from "+infra/logger.adapter";
import { prerequisites } from "+infra/prerequisites";
import { server, startup } from "./server";

(async function main() {
  await new bg.Prerequisites(Logger).check(prerequisites);

  const app = Bun.serve({
    fetch: server.fetch,
    maxRequestBodySize: BODY_LIMIT_MAX_SIZE,
  });

  Logger.info({
    message: "Server has started",
    component: "http",
    operation: "server_startup",
    metadata: { port: Env.PORT, startupTimeMs: startup.stop().ms },
  });

  new bg.GracefulShutdown(Logger).applyTo(app);
})();
