import * as bg from "@bgord/bun";
import type { EnvironmentSchemaType } from "+infra/env";

export function createShieldApiKey(Env: EnvironmentSchemaType): bg.ShieldPort {
  return new bg.ShieldApiKeyAdapter({ API_KEY: Env.API_KEY });
}
