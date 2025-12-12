import type * as bg from "@bgord/bun";
import { createSystemAdapters } from "+infra/adapters/system";
import type { EnvironmentSchemaType } from "+infra/env";
import { I18nConfig } from "+infra/i18n";
import { createPrerequisites } from "+infra/prerequisites";

export async function bootstrap(Env: bg.EnvironmentResultType<EnvironmentSchemaType>) {
  const System = createSystemAdapters(Env);

  const prerequisites = createPrerequisites(Env, System);

  return { Env, Adapters: { System }, Tools: { prerequisites, I18nConfig } };
}
