import * as bg from "@bgord/bun";
import * as tools from "@bgord/tools";
import type { EnvironmentType } from "+infra/env";

type Dependencies = { Clock: bg.ClockPort };

export function createShieldRateLimit(Env: EnvironmentType, deps: Dependencies): bg.ShieldPort {
  const CacheRepository = new bg.CacheRepositoryNodeCacheAdapter({ ttl: tools.Duration.Seconds(5) });
  const CacheResolver = new bg.CacheResolverSimpleAdapter({ CacheRepository });

  const HashContent = new bg.HashContentSha256BunAdapter();

  return new bg.ShieldRateLimitAdapter(
    {
      enabled: Env.type === bg.NodeEnvironmentEnum.production,
      resolver: new bg.CacheSubjectResolver(
        [
          new bg.CacheSubjectSegmentFixed("rate_limit"),
          new bg.CacheSubjectSegmentPath(),
          new bg.CacheSubjectSegmentUser(),
        ],
        { HashContent },
      ),
    },
    { CacheResolver, ...deps },
  );
}
