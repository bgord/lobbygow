import * as bg from "@bgord/bun";

export function createTimekeeper(
  type: bg.NodeEnvironmentEnum,
  deps: { Clock: bg.ClockPort },
): bg.TimekeeperPort {
  return {
    [bg.NodeEnvironmentEnum.local]: new bg.TimekeeperGoogleAdapter(),
    [bg.NodeEnvironmentEnum.test]: new bg.TimekeeperNoopAdapter(deps),
    [bg.NodeEnvironmentEnum.staging]: new bg.TimekeeperGoogleAdapter(),
    [bg.NodeEnvironmentEnum.production]: new bg.TimekeeperGoogleAdapter(),
  }[type];
}
