import * as bg from "@bgord/bun";
import * as tools from "@bgord/tools";

export const CacheRepositoryShieldRateLimit = new bg.CacheRepositoryNodeCacheAdapter({
  ttl: tools.Duration.Seconds(5),
});
