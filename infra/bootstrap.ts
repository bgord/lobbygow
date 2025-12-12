import { createNotifierAdapters } from "+infra/adapters/notifier";
import { createSystemAdapters } from "+infra/adapters/system";
import type { EnvironmentType } from "+infra/env";
import { I18nConfig } from "+infra/i18n";
import { createPrerequisites } from "+infra/prerequisites";

export async function bootstrap(Env: EnvironmentType) {
  const System = createSystemAdapters(Env);
  const Notifier = createNotifierAdapters(Env, System);

  const prerequisites = createPrerequisites(Env, System);

  return { Env, Adapters: { System, Notifier }, Tools: { prerequisites, I18nConfig } };
}
