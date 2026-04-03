import type * as bg from "@bgord/bun";
import type { EnvironmentResultType } from "+infra/env";
import { createBuildInfoConfig } from "./build-info-config.adapter";
import { createCronScheduler } from "./cron-scheduler.adapter";
import { createJobQueue } from "./job-queue.adapter";
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

export async function createTools(Env: EnvironmentResultType, deps: Dependencies) {
  const { JobQueue } = await createJobQueue(Env, deps);

  return {
    BuildInfoConfig: createBuildInfoConfig(Env, deps),
    CronScheduler: await createCronScheduler(Env, deps),
    JobQueue,
    Prerequisites: createPrerequisites(Env, deps),
    ShieldApiKey: createShieldApiKey(Env),
    ShieldBasicAuth: createShieldBasicAuth(Env),
    ShieldRateLimit: createShieldRateLimit(Env, deps),
    ShieldSecurity: createShieldSecurity(Env, deps),
    ShieldTimeout,
  };
}
