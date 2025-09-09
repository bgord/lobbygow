import * as bg from "@bgord/bun";
import * as tools from "@bgord/tools";
import { Env } from "./env";
import { LoggerWinstonProductionAdapter } from "./logger.adapter";

export const prerequisites = [
  new bg.PrerequisitePort({ label: "port", port: Env.PORT }),
  new bg.PrerequisiteTimezoneUTC({ label: "timezone", timezone: tools.Timezone.parse(Env.TZ) }),
  new bg.PrerequisiteRAM({
    label: "RAM",
    minimum: tools.Size.fromMB(128),
    enabled: Env.type !== bg.NodeEnvironmentEnum.local,
  }),
  new bg.PrerequisiteSpace({ label: "disk-space", minimum: tools.Size.fromMB(512) }),
  new bg.PrerequisiteNode({
    label: "node",
    version: tools.PackageVersion.fromStringWithV("v24.1.0"),
    current: process.version,
  }),
  new bg.PrerequisiteBun({
    label: "bun",
    version: tools.PackageVersion.fromString("1.2.20"),
    current: Bun.version,
  }),
  new bg.PrerequisiteMemory({ label: "memory-consumption", maximum: tools.Size.fromMB(300) }),
  new bg.PrerequisiteLogFile({
    label: "log-file",
    logger: LoggerWinstonProductionAdapter,
    enabled: Env.type === bg.NodeEnvironmentEnum.production,
  }),
];
