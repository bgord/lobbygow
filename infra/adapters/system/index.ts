import type { EnvironmentType } from "+infra/env";
import { createCertificateInspector } from "./certificate-inspector.adapter";
import { Clock } from "./clock.adapter";
import { createDiskSpaceChecker } from "./disk-space-checker.adapter";
import { FileReaderJson } from "./file-reader-json.adapter";
import { IdProvider } from "./id-provider.adapter";
import { createLogger } from "./logger.adapter";
import { createMailer } from "./mailer.adapter";
import { createTimekeeper } from "./timekeeper.adapter";

export function createSystemAdapters(Env: EnvironmentType) {
  const Logger = createLogger(Env);
  const Mailer = createMailer(Env, { Logger });
  const Timekeeper = createTimekeeper(Env, { Clock });

  return {
    CertificateInspector: createCertificateInspector(Env, { Clock }),
    Clock,
    DiskSpaceChecker: createDiskSpaceChecker(Env),
    IdProvider,
    FileReaderJson,
    Logger,
    Mailer,
    Timekeeper,
  };
}
