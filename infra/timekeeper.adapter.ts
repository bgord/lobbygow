import * as bg from "@bgord/bun";
import { Clock } from "+infra/clock.adapter";
import { Env } from "+infra/env";

export const Timekeeper: bg.TimekeeperPort = {
  [bg.NodeEnvironmentEnum.local]: new bg.TimekeeperGoogleAdapter(),
  [bg.NodeEnvironmentEnum.test]: new bg.TimekeeperNoopAdapter(Clock),
  [bg.NodeEnvironmentEnum.staging]: new bg.TimekeeperGoogleAdapter(),
  [bg.NodeEnvironmentEnum.production]: new bg.TimekeeperGoogleAdapter(),
}[Env.type];
