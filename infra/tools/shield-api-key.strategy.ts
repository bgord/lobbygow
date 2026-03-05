import * as bg from "@bgord/bun";
import type { EnvironmentType } from "+infra/env";

export function createShieldApiKey(Env: EnvironmentType): bg.ShieldApiKeyHonoStrategy {
  return new bg.ShieldApiKeyHonoStrategy({ API_KEY: Env.API_KEY });
}
