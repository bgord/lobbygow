import * as bg from "@bgord/bun";
import type { z } from "zod/v4";
import type { EnvironmentSchema } from "+infra/env";

export function createTimekeeper(
  Env: ReturnType<bg.EnvironmentValidator<z.infer<typeof EnvironmentSchema>>["load"]>,
  deps: { Clock: bg.ClockPort },
): bg.TimekeeperPort {
  return {
    [bg.NodeEnvironmentEnum.local]: new bg.TimekeeperGoogleAdapter(),
    [bg.NodeEnvironmentEnum.test]: new bg.TimekeeperNoopAdapter(deps),
    [bg.NodeEnvironmentEnum.staging]: new bg.TimekeeperGoogleAdapter(),
    [bg.NodeEnvironmentEnum.production]: new bg.TimekeeperGoogleAdapter(),
  }[Env.type];
}
