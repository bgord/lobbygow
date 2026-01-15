import * as bg from "@bgord/bun";
import * as tools from "@bgord/tools";
import { bootstrap } from "+infra/bootstrap";
import { createServer } from "./server";

(async function main() {
  const di = await bootstrap();
  const server = createServer(di);

  await new bg.PrerequisiteRunnerStartup(di.Adapters.System).check(di.Tools.Prerequisites);
  bg.EventLoopLag.start();

  const app = Bun.serve({
    port: di.Env.PORT,
    fetch: server.fetch,
    maxRequestBodySize: tools.Size.fromKb(128).toBytes(),
  });
  new bg.GracefulShutdown(di.Adapters.System).applyTo(app);

  di.Adapters.System.Logger.info({
    message: "Server has started",
    component: "http",
    operation: "server_startup",
    metadata: { port: di.Env.PORT },
  });
})();
