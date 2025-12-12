import * as bg from "@bgord/bun";
import type { EnvironmentSchema } from "+infra/env";

export function createShieldBasicAuth(Env: bg.EnvironmentResultType<typeof EnvironmentSchema>) {
  return new bg.ShieldBasicAuthAdapter({
    username: Env.BASIC_AUTH_USERNAME,
    password: Env.BASIC_AUTH_PASSWORD,
  });
}
