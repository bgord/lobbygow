import * as bg from "@bgord/bun";
import * as tools from "@bgord/tools";
import { basicAuth } from "hono/basic-auth";
import type { z } from "zod/v4";
import { EnvironmentSchema } from "+infra/env";
import { I18nConfig } from "+infra/i18n";

export async function bootstrap() {
  const Env = new bg.EnvironmentValidator<z.infer<typeof EnvironmentSchema>>({
    type: process.env.NODE_ENV,
    schema: EnvironmentSchema,
  }).load();

  const Clock = new bg.ClockSystemAdapter();
  const IdProvider = new bg.IdProviderCryptoAdapter();

  const Timekeeper: bg.TimekeeperPort = {
    [bg.NodeEnvironmentEnum.local]: new bg.TimekeeperGoogleAdapter(),
    [bg.NodeEnvironmentEnum.test]: new bg.TimekeeperNoopAdapter({ Clock }),
    [bg.NodeEnvironmentEnum.staging]: new bg.TimekeeperGoogleAdapter(),
    [bg.NodeEnvironmentEnum.production]: new bg.TimekeeperGoogleAdapter(),
  }[Env.type];

  const CertificateInspector = {
    [bg.NodeEnvironmentEnum.local]: new bg.CertificateInspectorTLSAdapter({ Clock }),
    [bg.NodeEnvironmentEnum.test]: new bg.CertificateInspectorNoopAdapter(30),
    [bg.NodeEnvironmentEnum.staging]: new bg.CertificateInspectorTLSAdapter({ Clock }),
    [bg.NodeEnvironmentEnum.production]: new bg.CertificateInspectorTLSAdapter({ Clock }),
  }[Env.type];

  const DiskSpaceCheckerNoopAdapter = new bg.DiskSpaceCheckerNoopAdapter(tools.Size.fromGB(10));
  const DiskSpaceCheckerBunAdapter = new bg.DiskSpaceCheckerBunAdapter();
  const DiskSpaceChecker: bg.DiskSpaceCheckerPort = {
    [bg.NodeEnvironmentEnum.local]: DiskSpaceCheckerBunAdapter,
    [bg.NodeEnvironmentEnum.test]: DiskSpaceCheckerNoopAdapter,
    [bg.NodeEnvironmentEnum.staging]: DiskSpaceCheckerNoopAdapter,
    [bg.NodeEnvironmentEnum.production]: DiskSpaceCheckerBunAdapter,
  }[Env.type];

  const JsonFileReaderBunForgiving = new bg.JsonFileReaderBunForgivingAdapter();
  const JsonFileReader: bg.JsonFileReaderPort = {
    [bg.NodeEnvironmentEnum.local]: JsonFileReaderBunForgiving,
    [bg.NodeEnvironmentEnum.test]: JsonFileReaderBunForgiving,
    [bg.NodeEnvironmentEnum.staging]: JsonFileReaderBunForgiving,
    [bg.NodeEnvironmentEnum.production]: JsonFileReaderBunForgiving,
  }[Env.type];

  // Logger ========================
  const app = "lobbygow";
  const redactor = new bg.RedactorCompositeAdapter([
    new bg.RedactorCompactArrayAdapter(),
    new bg.RedactorMaskAdapter(bg.RedactorMaskAdapter.DEFAULT_KEYS),
  ]);
  const LoggerWinstonLocalAdapter = new bg.LoggerWinstonLocalAdapter({ app, redactor }).create(
    Env.LOGS_LEVEL,
  );
  const LoggerWinstonProductionAdapter = new bg.LoggerWinstonProductionAdapter({
    app,
    AXIOM_API_TOKEN: Env.AXIOM_API_TOKEN,
    redactor,
  });
  const Logger: bg.LoggerPort = {
    [bg.NodeEnvironmentEnum.local]: LoggerWinstonLocalAdapter,
    [bg.NodeEnvironmentEnum.test]: new bg.LoggerNoopAdapter(),
    [bg.NodeEnvironmentEnum.staging]: new bg.LoggerNoopAdapter(),
    [bg.NodeEnvironmentEnum.production]: LoggerWinstonProductionAdapter.create(Env.LOGS_LEVEL),
  }[Env.type];
  // ===============================

  // Mailer ========================
  const Mailer = {
    [bg.NodeEnvironmentEnum.local]: new bg.MailerNoopAdapter(Logger),
    [bg.NodeEnvironmentEnum.test]: new bg.MailerNoopAdapter(Logger),
    [bg.NodeEnvironmentEnum.staging]: new bg.MailerNoopAdapter(Logger),
    [bg.NodeEnvironmentEnum.production]: new bg.MailerSmtpAdapter({
      SMTP_HOST: Env.SMTP_HOST,
      SMTP_PORT: Env.SMTP_PORT,
      SMTP_USER: Env.SMTP_USER,
      SMTP_PASS: Env.SMTP_PASS,
    }),
  }[Env.type];
  // ===============================

  const ShieldApiKey = new bg.ShieldApiKey({ API_KEY: Env.API_KEY });

  const ShieldBasicAuth = basicAuth({
    username: Env.BASIC_AUTH_USERNAME,
    password: Env.BASIC_AUTH_PASSWORD,
  });

  const production = Env.type === bg.NodeEnvironmentEnum.production;

  const prerequisites = [
    new bg.PrerequisitePort({ label: "port", port: Env.PORT }),
    new bg.PrerequisiteTimezoneUTC({ label: "timezone", timezone: tools.Timezone.parse(Env.TZ) }),
    new bg.PrerequisiteRAM({ label: "RAM", minimum: tools.Size.fromMB(128), enabled: production }),
    new bg.PrerequisiteSpace({ label: "disk-space", minimum: tools.Size.fromMB(512), DiskSpaceChecker }),
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
    new bg.PrerequisiteLogFile({
      label: "log-file",
      Logger: LoggerWinstonProductionAdapter,
      enabled: production,
    }),
    new bg.PrerequisiteMailer({ label: "mailer", Mailer, enabled: production }),
    new bg.PrerequisiteOutsideConnectivity({ label: "outside-connectivity", enabled: production }),
    new bg.PrerequisiteRunningUser({ label: "user", username: "bgord", enabled: production }),
    new bg.PrerequisiteSSLCertificateExpiry({
      label: "ssl",
      hostname: "lobbygow.bgord.dev",
      days: 7,
      enabled: production,
      CertificateInspector,
    }),
    new bg.PrerequisiteClockDrift({
      label: "clock-drift",
      enabled: production,
      skew: tools.Duration.Minutes(1),
      Timekeeper,
    }),
  ];

  const healthcheck = [
    new bg.PrerequisiteSelf({ label: "self" }),
    ...prerequisites.filter((prerequisite) => prerequisite.label !== "port"),
  ];

  return {
    Adapters: {
      System: {
        Clock,
        IdProvider,
        Timekeeper,
        CertificateInspector,
        DiskSpaceChecker,
        JsonFileReader,
        Logger,
        Mailer,
      },
    },
    Tools: { ShieldApiKey, ShieldBasicAuth, prerequisites, healthcheck, I18nConfig },
    Env,
  };
}
