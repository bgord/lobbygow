import * as bg from "@bgord/bun";
import * as tools from "@bgord/tools";
import type { z } from "zod/v4";
import { createSystemAdapters } from "+infra/adapters/system";
import type { EnvironmentSchema } from "+infra/env";
import { I18nConfig } from "+infra/i18n";

export async function bootstrap(
  Env: ReturnType<bg.EnvironmentValidator<z.infer<typeof EnvironmentSchema>>["load"]>,
) {
  const System = createSystemAdapters(Env);

  const production = Env.type === bg.NodeEnvironmentEnum.production;

  const prerequisites = [
    new bg.PrerequisitePort({ label: "port", port: Env.PORT }),
    new bg.PrerequisiteTimezoneUTC({ label: "timezone", timezone: tools.Timezone.parse(Env.TZ) }),
    new bg.PrerequisiteRAM({ label: "RAM", minimum: tools.Size.fromMB(128), enabled: production }),
    new bg.PrerequisiteSpace({
      label: "disk-space",
      minimum: tools.Size.fromMB(512),
      DiskSpaceChecker: System.DiskSpaceChecker,
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
    // new bg.PrerequisiteLogFile({
    //   label: "log-file",
    //   Logger: System.LoggerWinstonProductionAdapter,
    //   enabled: production,
    // }),
    new bg.PrerequisiteMailer({ label: "mailer", enabled: production, Mailer: System.Mailer }),
    new bg.PrerequisiteOutsideConnectivity({ label: "outside-connectivity", enabled: production }),
    new bg.PrerequisiteRunningUser({ label: "user", username: "bgord", enabled: production }),
    new bg.PrerequisiteSSLCertificateExpiry({
      label: "ssl",
      hostname: "lobbygow.bgord.dev",
      days: 7,
      enabled: production,
      CertificateInspector: System.CertificateInspector,
    }),
    new bg.PrerequisiteClockDrift({
      label: "clock-drift",
      enabled: production,
      skew: tools.Duration.Minutes(1),
      Timekeeper: System.Timekeeper,
    }),
  ];

  const healthcheck = [
    new bg.PrerequisiteSelf({ label: "self" }),
    ...prerequisites.filter((prerequisite) => prerequisite.label !== "port"),
  ];

  return {
    Adapters: { System },
    Tools: { prerequisites, healthcheck, I18nConfig },
    Env,
  };
}
