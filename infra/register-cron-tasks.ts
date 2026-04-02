import * as bg from "@bgord/bun";
import type { BootstrapType } from "+infra/bootstrap";

export function registerCronTasks({ Adapters }: BootstrapType) {
  new bg.CronTaskHandlerWithLoggerStrategy(Adapters.System);
}
