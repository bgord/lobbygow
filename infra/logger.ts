import * as bg from "@bgord/node";
import { Env } from "./env";

export const logger = new bg.Logger({
  app: "trackers",
  environment: Env.type,
  level: Env.LOGS_LEVEL,
});
