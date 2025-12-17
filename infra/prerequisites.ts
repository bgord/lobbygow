import * as bg from "@bgord/bun";
import * as tools from "@bgord/tools";
import { type EnvironmentType, MasterKeyPath, SecretsPath } from "+infra/env";

type Dependencies = {
  DiskSpaceChecker: bg.DiskSpaceCheckerPort;
  Logger: bg.LoggerPort;
  Mailer: bg.MailerPort;
  CertificateInspector: bg.CertificateInspectorPort;
  Timekeeper: bg.TimekeeperPort;
};

export function createPrerequisites(Env: EnvironmentType, deps: Dependencies) {
  const production = Env.type === bg.NodeEnvironmentEnum.production;
  const local = Env.type === bg.NodeEnvironmentEnum.local;

  return [
    new bg.PrerequisitePort({ label: "port", port: Env.PORT }),
    new bg.PrerequisiteTimezoneUTC({ label: "timezone", timezone: tools.Timezone.parse(Env.TZ) }),
    new bg.PrerequisiteRAM({ label: "RAM", minimum: tools.Size.fromMB(128), enabled: production }),
    new bg.PrerequisiteSpace({ label: "disk-space", minimum: tools.Size.fromMB(512) }, deps),
    new bg.PrerequisiteNode({
      label: "node",
      version: tools.PackageVersion.fromString("24.1.0"),
      current: process.version,
    }),
    new bg.PrerequisiteBun({
      label: "bun",
      version: tools.PackageVersion.fromString("1.3.5"),
      current: Bun.version,
    }),
    new bg.PrerequisiteMemory({ label: "memory-consumption", maximum: tools.Size.fromMB(300) }),
    new bg.PrerequisiteLogFile({ label: "log-file", enabled: production }, deps),
    new bg.PrerequisiteMailer({ label: "mailer", enabled: production }, deps),
    new bg.PrerequisiteOutsideConnectivity({ label: "outside-connectivity", enabled: production }),
    new bg.PrerequisiteRunningUser({ label: "user", username: "bgord", enabled: production }),
    new bg.PrerequisiteSSLCertificateExpiry(
      { label: "ssl", hostname: "lobbygow.bgord.dev", days: 7, enabled: production },
      deps,
    ),
    new bg.PrerequisiteClockDrift(
      { label: "clock-drift", skew: tools.Duration.Minutes(1), enabled: production },
      deps,
    ),
    new bg.PrerequisiteOs({ label: "os", accepted: ["Darwin", "Linux"] }),
    new bg.PrerequisiteBinary({ label: "gitleaks", binary: bg.Binary.parse("gitleaks"), enabled: local }),
    new bg.PrerequisiteFile({
      label: "master-key",
      file: MasterKeyPath,
      permissions: { read: true },
      enabled: production,
    }),
    new bg.PrerequisiteFile({
      label: "secrets",
      file: SecretsPath,
      permissions: { read: true },
      enabled: production,
    }),
  ];
}
