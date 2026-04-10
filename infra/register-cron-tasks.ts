import * as bg from "@bgord/bun";
import * as tools from "@bgord/tools";
import type { BootstrapType } from "+infra/bootstrap";

export function registerCronTasks({ Adapters, Tools }: BootstrapType) {
  const CronTaskHandler = new bg.CronTaskHandlerWithLoggerStrategy(Adapters.System);

  const JobWorker = CronTaskHandler.handle(
    bg.JobWorker(
      { label: "Job queue", cron: bg.CronExpressionSchedules.EVERY_MINUTE, limit: tools.Int.positive(1) },
      { ...Tools },
    ),
  );

  Tools.CronScheduler.schedule(JobWorker);
}
