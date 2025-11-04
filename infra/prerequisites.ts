import * as bg from "@bgord/bun";
import * as tools from "@bgord/tools";
import { Clock } from "+infra/clock.adapter";
import { Mailer } from "+infra/mailer.adapter";
import { Timekeeper } from "+infra/timekeeper.adapter";
import { CertificateInspector } from "./certificate-inspector.adapter";
import { DiskSpaceChecker } from "./disk-space-checker.adapter";
import { Env } from "./env";
import { LoggerWinstonProductionAdapter } from "./logger.adapter";

const production = Env.type === bg.NodeEnvironmentEnum.production;

export const prerequisites = [
  new bg.PrerequisitePort({ label: "port", port: Env.PORT }),
  new bg.PrerequisiteTimezoneUTC({ label: "timezone", timezone: tools.Timezone.parse(Env.TZ) }),
  new bg.PrerequisiteRAM({ label: "RAM", minimum: tools.Size.fromMB(128), enabled: production }),
  new bg.PrerequisiteSpace({
    label: "disk-space",
    minimum: tools.Size.fromMB(512),
    checker: DiskSpaceChecker,
  }),
  new bg.PrerequisiteNode({
    label: "node",
    version: tools.PackageVersion.fromString("24.1.0"),
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
    enabled: production,
  }),
  new bg.PrerequisiteMailer({ label: "mailer", mailer: Mailer, enabled: production }),
  new bg.PrerequisiteOutsideConnectivity({ label: "outside-connectivity", enabled: production }),
  new bg.PrerequisiteRunningUser({ label: "user", username: "bgord", enabled: production }),
  new bg.PrerequisiteSSLCertificateExpiry({
    label: "certificate",
    host: "lobbygow.bgord.dev",
    days: 7,
    enabled: production,
    inspector: CertificateInspector,
  }),
  new bg.PrerequisiteClockDrift({
    label: "certificate",
    enabled: production,
    skew: tools.Duration.Minutes(1),
    clock: Clock,
    timekeeper: Timekeeper,
  }),
];
