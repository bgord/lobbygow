import * as bg from "@bgord/bun";
import * as tools from "@bgord/tools";
import { bootstrap } from "+infra/bootstrap";
import { EnvironmentSchema } from "+infra/env";
import { createServer } from "./server";

(async function main() {
  const Env = new bg.EnvironmentValidator({ type: process.env.NODE_ENV, schema: EnvironmentSchema }).load(
    process.env,
  );

  const di = await bootstrap(Env);

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
