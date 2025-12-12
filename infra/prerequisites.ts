import * as bg from "@bgord/bun";
import * as tools from "@bgord/tools";
import type { EnvironmentType } from "+infra/env";

type Dependencies = {
  DiskSpaceChecker: bg.DiskSpaceCheckerPort;
  Logger: bg.LoggerPort;
  Mailer: bg.MailerPort;
  CertificateInspector: bg.CertificateInspectorPort;
  Timekeeper: bg.TimekeeperPort;
};

export function createPrerequisites(Env: EnvironmentType, deps: Dependencies) {
  const production = Env.type === bg.NodeEnvironmentEnum.production;

  return [
    new bg.PrerequisitePort({ label: "port", port: Env.PORT }),
    new bg.PrerequisiteTimezoneUTC({ label: "timezone", timezone: tools.Timezone.parse(Env.TZ) }),
    new bg.PrerequisiteRAM({ label: "RAM", minimum: tools.Size.fromMB(128), enabled: production }),
    new bg.PrerequisiteSpace({
      label: "disk-space",
      minimum: tools.Size.fromMB(512),
      DiskSpaceChecker: deps.DiskSpaceChecker,
    }),
    new bg.PrerequisiteNode({
      label: "node",
      version: tools.PackageVersion.fromString("24.1.0"),
      current: process.version,
    }),
    new bg.PrerequisiteBun({
      label: "bun",
      version: tools.PackageVersion.fromString("1.3.4"),
      current: Bun.version,
    }),
    new bg.PrerequisiteMemory({ label: "memory-consumption", maximum: tools.Size.fromMB(300) }),
    new bg.PrerequisiteLogFile({ label: "log-file", Logger: deps.Logger, enabled: production }),
    new bg.PrerequisiteMailer({ label: "mailer", enabled: production, Mailer: deps.Mailer }),
    new bg.PrerequisiteOutsideConnectivity({ label: "outside-connectivity", enabled: production }),
    new bg.PrerequisiteRunningUser({ label: "user", username: "bgord", enabled: production }),
    new bg.PrerequisiteSSLCertificateExpiry({
      label: "ssl",
      hostname: "lobbygow.bgord.dev",
      days: 7,
      CertificateInspector: deps.CertificateInspector,
      enabled: production,
    }),
    new bg.PrerequisiteClockDrift({
      label: "clock-drift",
      skew: tools.Duration.Minutes(1),
      Timekeeper: deps.Timekeeper,
      enabled: production,
    }),
  ];
}
