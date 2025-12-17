import type { EnvironmentType } from "+infra/env";
import { CacheRepository } from "./cache-repository.adapter";
import { createCacheResolver } from "./cache-resolver.adapter";
import { createCertificateInspector } from "./certificate-inspector.adapter";
import { createClock } from "./clock.adapter";
import { createDiskSpaceChecker } from "./disk-space-checker.adapter";
import { createIdProvider } from "./id-provider.adapter";
import { createJsonFileReader } from "./json-file-reader.adapter";
import { createLogger } from "./logger.adapter";
import { createMailer } from "./mailer.adapter";
import { createShieldApiKey } from "./shield-api-key.adapter";
import { createShieldBasicAuth } from "./shield-basic-auth.adapter";
import { createShieldRateLimit } from "./shield-rate-limit.adapter";
import { createShieldTimeout } from "./shield-timeout.adapter";
import { createTimekeeper } from "./timekeeper.adapter";

export function createSystemAdapters(Env: EnvironmentType) {
  const Clock = createClock();
  const IdProvider = createIdProvider();
  const Logger = createLogger(Env);
  const Mailer = createMailer(Env, { Logger });
  const ShieldApiKey = createShieldApiKey(Env);
  const Timekeeper = createTimekeeper(Env, { Clock });
  const CacheResolver = createCacheResolver({ CacheRepository });

  return {
    ShieldBasicAuth: createShieldBasicAuth(Env),
    CertificateInspector: createCertificateInspector(Env, { Clock }),
    Clock,
    DiskSpaceChecker: createDiskSpaceChecker(Env),
    IdProvider,
    JsonFileReader: createJsonFileReader(),
    Logger,
    Mailer,
    ShieldApiKey,
    Timekeeper,
    ShieldTimeout: createShieldTimeout(),
    ShieldRateLimit: createShieldRateLimit(Env, { Clock, CacheResolver }),
  };
}
