import type * as bg from "@bgord/bun";
import type { EnvironmentType } from "+infra/env";
import { createShieldRateLimit } from "./shield-rate-limit.adapter";

type Dependencies = { Clock: bg.ClockPort };

export function createNotifierAdapters(Env: EnvironmentType, deps: Dependencies) {
  const ShieldRateLimit = createShieldRateLimit(Env, deps);

  return { ShieldRateLimit };
}
