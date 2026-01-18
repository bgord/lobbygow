import { createSystemAdapters } from "+infra/adapters/system";
import { createEnvironmentLoader } from "+infra/env";
import { createTools } from "+infra/tools";

export async function bootstrap() {
  const EnvironmentLoader = await createEnvironmentLoader();
  const Env = await EnvironmentLoader.load();
  const System = await createSystemAdapters(Env);

  return { Env, Adapters: { System }, Tools: createTools(Env, System) };
}
