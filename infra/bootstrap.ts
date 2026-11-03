import { createSystemAdapters } from "+infra/adapters/system";
import { createEnvironmentLoader } from "+infra/env";
import { createTools } from "+infra/tools";
import { createPrerequisites } from "+infra/tools/prerequisites";

export async function bootstrap() {
  const EnvironmentLoader = await createEnvironmentLoader();
  const Env = await EnvironmentLoader.load();
  const System = await createSystemAdapters(Env);
  const Tools = await createTools(Env, System);

  return {
    Env,
    Adapters: { System },
    Tools: { ...Tools, Prerequisites: createPrerequisites(Env, { ...System, ...Tools }) },
  };
}

export type BootstrapType = Awaited<ReturnType<typeof bootstrap>>;
