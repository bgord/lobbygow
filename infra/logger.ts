import * as bg from "@bgord/bun";
import { Env } from "./env";

const app = "lobbygow";

export const logger = new bg.Logger({
  app,
  environment: Env.type,
  level: Env.LOGS_LEVEL,
  transports:
    Env.type === bg.NodeEnvironmentEnum.production
      ? [new bg.AxiomTransport({ dataset: app, token: Env.AXIOM_API_TOKEN })]
      : [],
});
