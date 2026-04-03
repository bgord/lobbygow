import type { EnvironmentResultType } from "+infra/env";
import { createCertificateInspector } from "./certificate-inspector.adapter";
import { createClock } from "./clock.adapter";
import { createDiskSpaceChecker } from "./disk-space-checker.adapter";
import { createFileInspection } from "./file-inspection.adapter";
import { FileReaderJson } from "./file-reader-json.adapter";
import { IdProvider } from "./id-provider.adapter";
import { createLogger } from "./logger.adapter";
import { createMailer } from "./mailer.adapter";
import { createSleeper } from "./sleeper.adapter";
import { createTimekeeper } from "./timekeeper.adapter";
import { createTimeoutRunner } from "./timeout-runner.adapter";

export async function createSystemAdapters(Env: EnvironmentResultType) {
  const Clock = createClock(Env);
  const Logger = createLogger(Env, { Clock });
  const Sleeper = createSleeper(Env);
  const TimeoutRunner = createTimeoutRunner(Env);
  const Mailer = await createMailer(Env, { Logger, Clock, Sleeper, TimeoutRunner });
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
    Sleeper,
    TimeoutRunner,
    FileInspection: createFileInspection(Env),
  };
}
