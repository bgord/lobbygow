import * as bg from "@bgord/bun";
import type { EnvironmentResultType } from "+infra/env";

type Dependencies = { Logger: bg.LoggerPort };

export async function createCronScheduler(
  Env: EnvironmentResultType,
  deps: Dependencies,
): Promise<bg.CronSchedulerPort> {
  const CronScheduler = new bg.CronSchedulerAdapter();

  return {
    [bg.NodeEnvironmentEnum.local]: CronScheduler,
    [bg.NodeEnvironmentEnum.test]: new bg.CronSchedulerNoopAdapter(),
    [bg.NodeEnvironmentEnum.staging]: CronScheduler,
    [bg.NodeEnvironmentEnum.production]: new bg.CronSchedulerWithLoggerAdapter({
      inner: CronScheduler,
      ...deps,
    }),
  }[Env.type];
}
