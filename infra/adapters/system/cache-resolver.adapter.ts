import * as bg from "@bgord/bun";

type Dependencies = { CacheRepository: bg.CacheRepositoryPort };

export function createCacheResolver(deps: Dependencies): bg.CacheResolverPort {
  return new bg.CacheResolverSimpleAdapter(deps);
}
