import * as bg from "@bgord/bun";
import * as tools from "@bgord/tools";

export const CacheRepository = new bg.CacheRepositoryNodeCacheAdapter({ ttl: tools.Duration.Minutes(5) });
