import * as bg from "@bgord/bun";
import * as tools from "@bgord/tools";
import type { BootstrapType } from "+infra/bootstrap";

export function registerCronTasks({ Adapters, Tools }: BootstrapType) {
  const CronTaskHandler = new bg.CronTaskHandlerWithLoggerStrategy(Adapters.System);

  const JobQueueWorker = CronTaskHandler.handle(
    bg.JobQueueWorker(
      {
        label: "Job queue worker",
        cron: bg.CronExpressionSchedules.EVERY_MINUTE,
        limit: tools.Int.positive(1),
      },
      { ...Tools },
    ),
  );
  Tools.CronScheduler.schedule(JobQueueWorker);

  const JobPruner = CronTaskHandler.handle(
    bg.JobPrunerWorker(
      {
        label: "Job pruner worker",
        cron: bg.CronExpressionSchedules.EVERY_MINUTE,
        olderThan: tools.Duration.Days(1),
      },
      { ...Tools },
    ),
  );
  Tools.CronScheduler.schedule(JobPruner);
}
