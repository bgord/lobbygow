import * as bg from "@bgord/bun";
import type { EnvironmentType } from "+infra/env";

export function createShieldApiKey(Env: EnvironmentType): bg.ShieldStrategy {
  return new bg.ShieldApiKeyStrategy({ API_KEY: Env.API_KEY });
}
