import * as bg from "@bgord/bun";
import type { EnvironmentResultType } from "+infra/env";

export function createShieldApiKey(Env: EnvironmentResultType): bg.ShieldApiKeyHonoStrategy {
  return new bg.ShieldApiKeyHonoStrategy({ API_KEY: Env.API_KEY });
}
