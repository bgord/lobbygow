import * as bg from "@bgord/bun";
import { BODY_LIMIT_MAX_SIZE } from "+infra";
import { bootstrap } from "+infra/bootstrap";
import { createServer } from "./server";

(async function main() {
  const di = await bootstrap();
  const { server, startup } = createServer(di);

  await new bg.Prerequisites(di.Adapters.System).check(di.Tools.prerequisites);

  const app = Bun.serve({
    fetch: server.fetch,
    maxRequestBodySize: BODY_LIMIT_MAX_SIZE,
  });

  di.Adapters.System.Logger.info({
    message: "Server has started",
    component: "http",
    operation: "server_startup",
    metadata: { port: di.Env.PORT, startupTimeMs: startup.stop().ms },
  });

  new bg.GracefulShutdown(di.Adapters.System).applyTo(app);
})();
