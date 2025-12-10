import type * as bg from "@bgord/bun";
import { basicAuth } from "hono/basic-auth";
import type { z } from "zod/v4";
import type { EnvironmentSchema } from "+infra/env";

export function createBasicAuth(
  Env: ReturnType<bg.EnvironmentValidator<z.infer<typeof EnvironmentSchema>>["load"]>,
) {
  return basicAuth({ username: Env.BASIC_AUTH_USERNAME, password: Env.BASIC_AUTH_PASSWORD });
}
