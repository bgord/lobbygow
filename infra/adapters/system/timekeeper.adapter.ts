import * as bg from "@bgord/bun";
import type { EnvironmentSchema } from "+infra/env";

type Dependencies = { Clock: bg.ClockPort };

export function createTimekeeper(
  Env: bg.EnvironmentResultType<typeof EnvironmentSchema>,
  deps: Dependencies,
): bg.TimekeeperPort {
  return {
    [bg.NodeEnvironmentEnum.local]: new bg.TimekeeperGoogleAdapter(),
    [bg.NodeEnvironmentEnum.test]: new bg.TimekeeperNoopAdapter(deps),
    [bg.NodeEnvironmentEnum.staging]: new bg.TimekeeperGoogleAdapter(),
    [bg.NodeEnvironmentEnum.production]: new bg.TimekeeperGoogleAdapter(),
  }[Env.type];
}
