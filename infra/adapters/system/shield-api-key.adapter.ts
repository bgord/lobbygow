import * as bg from "@bgord/bun";
import type { EnvironmentSchema } from "+infra/env";

export function createShieldApiKey(Env: bg.EnvironmentResultType<typeof EnvironmentSchema>): bg.ShieldPort {
  return new bg.ShieldApiKeyAdapter({ API_KEY: Env.API_KEY });
}
