import * as bg from "@bgord/bun";
import type { EnvironmentType } from "+infra/env";

export function createShieldApiKey(Env: EnvironmentType): bg.ShieldPort {
  return new bg.ShieldApiKeyAdapter({ API_KEY: Env.API_KEY });
}
