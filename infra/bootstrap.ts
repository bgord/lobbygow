import { createSystemAdapters } from "+infra/adapters/system";
import type { EnvironmentType } from "+infra/env";
import { I18nConfig } from "+infra/i18n";
import { createPrerequisites } from "+infra/prerequisites";

export async function bootstrap(Env: EnvironmentType) {
  const System = createSystemAdapters(Env);

  const prerequisites = createPrerequisites(Env, System);

  return { Env, Adapters: { System }, Tools: { prerequisites, I18nConfig } };
}
