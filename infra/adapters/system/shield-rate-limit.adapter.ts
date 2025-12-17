import * as bg from "@bgord/bun";
import type { EnvironmentType } from "+infra/env";

type Dependencies = { Clock: bg.ClockPort; CacheResolver: bg.CacheResolverPort };

export function createShieldRateLimit(Env: EnvironmentType, deps: Dependencies): bg.ShieldPort {
  return new bg.ShieldRateLimitAdapter(
    { enabled: Env.type === bg.NodeEnvironmentEnum.production, subject: bg.RateLimitSubjectAnon },
    deps,
  );
}
