import { createSystemAdapters } from "+infra/adapters/system";
import { createEnvironmentLoader } from "+infra/env";
import { I18nConfig } from "+infra/i18n";
import { createPrerequisites } from "+infra/prerequisites";

export async function bootstrap() {
  const EnvironmentLoader = await createEnvironmentLoader();
  const Env = await EnvironmentLoader.load();
  const System = createSystemAdapters(Env);

  const prerequisites = createPrerequisites(Env, System);

  return { Env, Adapters: { System }, Tools: { prerequisites, I18nConfig } };
}
