import * as bg from "@bgord/bun";
import * as tools from "@bgord/tools";
import * as Notifier from "+notifier";
import type { EnvironmentResultType } from "+infra/env";

type Dependencies = { Clock: bg.ClockPort; Mailer: bg.MailerPort };

type AcceptedJob = Notifier.Jobs.SendEmailJobType;

export async function createJobQueue(
  Env: EnvironmentResultType,
  deps: Dependencies,
): Promise<{ JobQueue: bg.JobQueuePort<AcceptedJob>; JobQueueStatsProvider: bg.JobQueueStatsProviderPort }> {
  const store = new bg.JobQueueSqliteStore({ database: ":memory:" });

  const registry = new bg.JobRegistryAdapter<AcceptedJob>({
    [Notifier.Jobs.SEND_EMAIL_JOB]: {
      schema: Notifier.Jobs.SendEmailJobSchema,
      retry: new bg.JobRetryPolicyLimitStrategy(tools.Int.nonNegative(3)),
      handler: Notifier.JobHandlers.SendEmailJobHandler(deps),
    },
  });

  const JobQueue = new bg.JobQueueAdapter<AcceptedJob>({
    registry,
    enqueuer: new bg.JobEnqueuerSqliteAdapter({ db: store.db, ...deps }),
    claimer: new bg.JobClaimerSqliteAdapter({ db: store.db, ...deps }),
    completer: new bg.JobCompleterSqliteAdapter({ db: store.db }),
    failer: new bg.JobFailerSqliteAdapter({ db: store.db }),
    requeuer: new bg.JobRequeuerSqliteAdapter({ db: store.db, ...deps }),
    serializer: new bg.PayloadSerializerJsonAdapter(),
  });

  return {
    JobQueue: {
      [bg.NodeEnvironmentEnum.local]: JobQueue,
      [bg.NodeEnvironmentEnum.test]: new bg.JobQueueAdapterNoop<AcceptedJob>({ registry }),
      [bg.NodeEnvironmentEnum.staging]: JobQueue,
      [bg.NodeEnvironmentEnum.production]: JobQueue,
    }[Env.type],

    JobQueueStatsProvider: {
      [bg.NodeEnvironmentEnum.local]: new bg.JobQueueStatsProviderNoopAdapter(),
      [bg.NodeEnvironmentEnum.test]: new bg.JobQueueStatsProviderNoopAdapter(),
      [bg.NodeEnvironmentEnum.staging]: new bg.JobQueueStatsProviderNoopAdapter(),
      [bg.NodeEnvironmentEnum.production]: new bg.JobQueueStatsProviderSqliteAdapter(store),
    }[Env.type],
  };
}
