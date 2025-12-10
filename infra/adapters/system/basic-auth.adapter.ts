import { basicAuth } from "hono/basic-auth";
import type { EnvironmentSchemaType } from "+infra/env";

export function createBasicAuth(Env: EnvironmentSchemaType) {
  return basicAuth({ username: Env.BASIC_AUTH_USERNAME, password: Env.BASIC_AUTH_PASSWORD });
}
