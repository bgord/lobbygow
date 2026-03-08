import type * as bg from "@bgord/bun";
import type { EnvironmentType } from "+infra/env";
import { createBuildInfoRepository } from "./build-info-repository.strategy";
import { createPrerequisites } from "./prerequisites";
import { createShieldApiKey } from "./shield-api-key.strategy";
import { createShieldBasicAuth } from "./shield-basic-auth.strategy";
import { createShieldRateLimit } from "./shield-rate-limit.strategy";
import { createShieldSecurity } from "./shield-security.strategy";
import { ShieldTimeout } from "./shield-timeout.strategy";

type Dependencies = {
  Clock: bg.ClockPort;
  DiskSpaceChecker: bg.DiskSpaceCheckerPort;
  Logger: bg.LoggerPort;
  Mailer: bg.MailerPort;
  CertificateInspector: bg.CertificateInspectorPort;
  Timekeeper: bg.TimekeeperPort;
  Sleeper: bg.SleeperPort;
  TimeoutRunner: bg.TimeoutRunnerPort;
  FileReaderJson: bg.FileReaderJsonPort;
  FileInspection: bg.FileInspectionPort;
};

export function createTools(Env: EnvironmentType, deps: Dependencies) {
  return {
    ShieldTimeout,
    ShieldRateLimit: createShieldRateLimit(Env, deps),
    ShieldBasicAuth: createShieldBasicAuth(Env),
    ShieldApiKey: createShieldApiKey(Env),
    Prerequisites: createPrerequisites(Env, deps),
    ShieldSecurity: createShieldSecurity(Env, deps),
    BuildInfoRepository: createBuildInfoRepository(Env, deps),
  };
}
