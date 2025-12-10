import type * as bg from "@bgord/bun";
import type { z } from "zod/v4";
import type { EnvironmentSchema } from "+infra/env";
import { createBasicAuth } from "./basic-auth.adapter";
import { createCertificateInspector } from "./certificate-inspector.adapter";
import { createClock } from "./clock.adapter";
import { createDiskSpaceChecker } from "./disk-space-checker.adapter";
import { createIdProvider } from "./id-provider.adapter";
import { createJsonFileReader } from "./json-file-reader.adapter";
import { createLogger } from "./logger.adapter";
import { createMailer } from "./mailer.adapter";
import { createShieldApiKey } from "./shield-api-key.adapter";
import { createTimekeeper } from "./timekeeper.adapter";

export function createSystemAdapters(
  Env: ReturnType<bg.EnvironmentValidator<z.infer<typeof EnvironmentSchema>>["load"]>,
) {
  const Clock = createClock();
  const IdProvider = createIdProvider();
  const Logger = createLogger(Env);
  const Mailer = createMailer(Env, { Logger });
  const ShieldApiKey = createShieldApiKey(Env);
  const Timekeeper = createTimekeeper(Env, { Clock });

  return {
    BasicAuth: createBasicAuth(Env),
    CertificateInspector: createCertificateInspector(Env, { Clock }),
    Clock,
    DiskSpaceChecker: createDiskSpaceChecker(Env),
    IdProvider,
    JsonFileReader: createJsonFileReader(),
    Logger,
    Mailer,
    ShieldApiKey,
    Timekeeper,
  };
}
