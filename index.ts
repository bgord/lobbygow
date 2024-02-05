import express from "express";
import * as bg from "@bgord/node";

import * as App from "./app";
import * as infra from "./infra";

const app = express();

bg.addExpressEssentials(app);
bg.Handlebars.applyTo(app);
bg.HttpLogger.applyTo(app, infra.logger);

// Healthcheck =================
app.get(
  "/healthcheck",
  bg.RateLimitShield.build(bg.Time.Seconds(15)),
  bg.Timeout.build(bg.Time.Seconds(15)),
  infra.BasicAuthShield.verify,
  bg.Healthcheck.build(infra.healthcheck)
);
// =============================

app.use(App.Routes.ErrorHandler.handle);

(async function main() {
  await bg.Prerequisites.check(infra.prerequisites);

  const server = app.listen(infra.Env.PORT, async () =>
    infra.logger.info({
      message: "Server has started",
      operation: "server_startup",
      metadata: { port: infra.Env.PORT },
    })
  );

  bg.GracefulShutdown.applyTo(server);
})();
