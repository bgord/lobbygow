import * as bg from "@bgord/bun";
import * as tools from "@bgord/tools";
import { type EnvironmentType, MasterKeyPath, SecretsPath } from "+infra/env";

type Dependencies = {
  Clock: bg.ClockPort;
  DiskSpaceChecker: bg.DiskSpaceCheckerPort;
  Logger: bg.LoggerPort;
  Mailer: bg.MailerPort;
  CertificateInspector: bg.CertificateInspectorPort;
  Timekeeper: bg.TimekeeperPort;
  Sleeper: bg.SleeperPort;
  TimeoutRunner: bg.TimeoutRunnerPort;
};

export function createPrerequisites(Env: EnvironmentType, deps: Dependencies) {
  const production = Env.type === bg.NodeEnvironmentEnum.production;
  const local = Env.type === bg.NodeEnvironmentEnum.local;

  const withTimeout = bg.PrerequisiteDecorator.withTimeout(tools.Duration.Seconds(2), deps);
  const withFailSafe = bg.PrerequisiteDecorator.withFailSafe(
    (result) => result.outcome === bg.PrerequisiteVerificationOutcome.failure,
  );
  const withRetry = bg.PrerequisiteDecorator.withRetry(
    {
      max: tools.IntegerPositive.parse(2),
      backoff: new bg.RetryBackoffLinearStrategy(tools.Duration.Ms(300)),
    },
    deps,
  );

  return [
    new bg.Prerequisite("port", new bg.PrerequisiteVerifierPortAdapter({ port: Env.PORT })),
    new bg.Prerequisite(
      "timezone",
      new bg.PrerequisiteVerifierTimezoneUtcAdapter({ timezone: tools.Timezone.parse(Env.TZ) }),
    ),
    new bg.Prerequisite("ram", new bg.PrerequisiteVerifierRamAdapter({ minimum: tools.Size.fromMB(128) }), {
      enabled: production,
      decorators: [withRetry],
    }),
    new bg.Prerequisite(
      "disk-space",
      new bg.PrerequisiteVerifierSpaceAdapter({ minimum: tools.Size.fromMB(512) }, deps),
      { decorators: [withRetry] },
    ),
    new bg.Prerequisite(
      "node",
      new bg.PrerequisiteVerifierNodeAdapter({
        version: tools.PackageVersion.fromString("24.1.0"),
        current: process.version,
      }),
    ),
    new bg.Prerequisite(
      "bun",
      new bg.PrerequisiteVerifierBunAdapter({
        version: tools.PackageVersion.fromString("1.3.6"),
        current: Bun.version,
      }),
    ),
    new bg.Prerequisite(
      "memory-consumption",
      new bg.PrerequisiteVerifierMemoryAdapter({ maximum: tools.Size.fromMB(300) }),
      { decorators: [withRetry, withTimeout] },
    ),
    new bg.Prerequisite("mailer", new bg.PrerequisiteVerifierMailerAdapter(deps), {
      enabled: production,
      decorators: [withRetry, withTimeout],
    }),
    new bg.Prerequisite("outside-connectivity", new bg.PrerequisiteVerifierOutsideConnectivityAdapter(), {
      enabled: production,
      decorators: [withFailSafe, withRetry, withTimeout],
    }),
    new bg.Prerequisite("user", new bg.PrerequisiteVerifierRunningUserAdapter({ username: "bgord" }), {
      enabled: production,
    }),
    new bg.Prerequisite(
      "ssl",
      new bg.PrerequisiteVerifierSSLCertificateExpiryAdapter(
        { hostname: "lobbygow.bgord.dev", minimum: tools.Duration.Days(7) },
        deps,
      ),
      { enabled: production, decorators: [withFailSafe, withRetry, withTimeout] },
    ),
    new bg.Prerequisite(
      "clock-drift",
      new bg.PrerequisiteVerifierClockDriftAdapter({ skew: tools.Duration.Minutes(1) }, deps),
      { enabled: production, decorators: [withRetry, withTimeout] },
    ),
    new bg.Prerequisite("os", new bg.PrerequisiteVerifierOsAdapter({ accepted: ["Darwin", "Linux"] })),
    new bg.Prerequisite(
      "gitleaks",
      new bg.PrerequisiteVerifierBinaryAdapter({ binary: bg.Binary.parse("gitleaks") }),
      { enabled: local },
    ),
    new bg.Prerequisite(
      "master-key",
      new bg.PrerequisiteVerifierFileAdapter({ file: MasterKeyPath, permissions: { read: true } }),
      { enabled: production },
    ),
    new bg.Prerequisite(
      "secrets",
      new bg.PrerequisiteVerifierFileAdapter({ file: SecretsPath, permissions: { read: true } }),
      { enabled: production },
    ),
    new bg.Prerequisite(
      "build-info-file",
      new bg.PrerequisiteVerifierFileAdapter({
        file: bg.BUILD_INFO_REPOSITORY_FILE_PATH,
        permissions: { read: true },
      }),
      { enabled: production },
    ),
  ];
}
