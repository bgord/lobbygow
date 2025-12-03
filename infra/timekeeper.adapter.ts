import * as bg from "@bgord/bun";
import { Clock } from "+infra/clock.adapter";
import { Env } from "+infra/env";

const deps = { Clock };

export const Timekeeper: bg.TimekeeperPort = {
  [bg.NodeEnvironmentEnum.local]: new bg.TimekeeperGoogleAdapter(),
  [bg.NodeEnvironmentEnum.test]: new bg.TimekeeperNoopAdapter(deps),
  [bg.NodeEnvironmentEnum.staging]: new bg.TimekeeperGoogleAdapter(),
  [bg.NodeEnvironmentEnum.production]: new bg.TimekeeperGoogleAdapter(),
}[Env.type];
