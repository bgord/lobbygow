import * as bg from "@bgord/bun";
import * as tools from "@bgord/tools";
import { bootstrap } from "+infra/bootstrap";
import { createServer } from "./server";

(async function main() {
  const di = await bootstrap();
  const server = createServer(di);

  await new bg.Prerequisites(di.Adapters.System).check(di.Tools.prerequisites);

  const app = Bun.serve({ fetch: server.fetch, maxRequestBodySize: tools.Size.fromKb(128).toBytes() });
  new bg.GracefulShutdown(di.Adapters.System).applyTo(app);

  di.Adapters.System.Logger.info({
    message: "Server has started",
    component: "http",
    operation: "server_startup",
    metadata: { port: di.Env.PORT },
  });
})();
