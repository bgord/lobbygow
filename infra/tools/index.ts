import type * as bg from "@bgord/bun";
import type { EnvironmentResultType } from "+infra/env";
import { createBuildInfoConfig } from "./build-info-config.adapter";
import { createCronScheduler } from "./cron-scheduler.adapter";
import { HashContent } from "./hash-content.strategy";
import { createJobQueue } from "./job-queue.adapter";
import { createShieldApiKey } from "./shield-api-key.strategy";
import { createShieldBasicAuth } from "./shield-basic-auth.strategy";
import { createShieldRateLimit } from "./shield-rate-limit.strategy";
import { createShieldSecurity } from "./shield-security.strategy";
import { ShieldTimeout } from "./shield-timeout.strategy";

type Dependencies = {
  Clock: bg.ClockPort;
  Logger: bg.LoggerPort;
  Mailer: bg.MailerPort;
  Sleeper: bg.SleeperPort;
  FileReaderJson: bg.FileReaderJsonPort;
};

export async function createTools(Env: EnvironmentResultType, deps: Dependencies) {
  const { JobQueue, JobQueueStatsProvider, JobPruner } = await createJobQueue(Env, deps);

  return {
    BuildInfoConfig: createBuildInfoConfig(Env, deps),
    CronScheduler: await createCronScheduler(Env, deps),
    JobQueue,
    JobQueueStatsProvider,
    ShieldApiKey: createShieldApiKey(Env),
    ShieldBasicAuth: createShieldBasicAuth(Env),
    ShieldRateLimit: createShieldRateLimit(Env, { ...deps, HashContent }),
    ShieldSecurity: createShieldSecurity(Env, { ...deps, HashContent }),
    ShieldTimeout,
    HashContent,
    JobPruner,
  };
}
