import * as bg from "@bgord/bun";
import type { z } from "zod/v4";
import type { EnvironmentSchema } from "+infra/env";

export function createShieldApiKey(
  Env: ReturnType<bg.EnvironmentValidator<z.infer<typeof EnvironmentSchema>>["load"]>,
): bg.ShieldPort {
  return new bg.ShieldApiKeyAdapter({ API_KEY: Env.API_KEY });
}
