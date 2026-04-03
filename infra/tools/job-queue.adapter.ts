import * as bg from "@bgord/bun";
import * as tools from "@bgord/tools";
import * as Notifier from "+notifier";
import type { EnvironmentResultType } from "+infra/env";

type Dependencies = { Logger: bg.LoggerPort; Clock: bg.ClockPort };

export type AcceptedJob = Notifier.Jobs.SendEmailJobType;

export async function createJobQueue(
  Env: EnvironmentResultType,
  deps: Dependencies,
): Promise<bg.JobQueuePort<AcceptedJob>> {
  const store = new bg.JobQueueSqliteStore({ database: ":memory:" });

  const registry = new bg.JobRegistryAdapter<AcceptedJob>({
    [Notifier.Jobs.SEND_EMAIL_JOB]: {
      schema: Notifier.Jobs.SendEmailJobSchema,
      retry: new bg.JobRetryPolicyLimitStrategy(tools.Int.nonNegative(3)),
      handler: async (job: Notifier.Jobs.SendEmailJobType) => console.log(job),
    },
  });

  const inner = new bg.JobQueueAdapter<AcceptedJob>({
    registry,
    enqueuer: new bg.JobEnqueuerSqliteAdapter({ db: store.db, ...deps }),
    claimer: new bg.JobClaimerSqliteAdapter({ db: store.db, ...deps }),
    completer: new bg.JobCompleterSqliteAdapter({ db: store.db }),
    failer: new bg.JobFailerSqliteAdapter({ db: store.db }),
    requeuer: new bg.JobRequeuerSqliteAdapter({ db: store.db, ...deps }),
    serializer: new bg.PayloadSerializerJsonAdapter(),
  });

  const JobQueue = new bg.JobQueueWithLoggerAdapter<AcceptedJob>({ inner, ...deps });

  return {
    [bg.NodeEnvironmentEnum.local]: JobQueue,
    [bg.NodeEnvironmentEnum.test]: new bg.JobQueueAdapter<AcceptedJob>({
      registry,
      enqueuer: new bg.JobEnqueuerNoopAdapter(),
      claimer: new bg.JobClaimerNoopAdapter(),
      completer: new bg.JobCompleterNoopAdapter(),
      failer: new bg.JobFailerNoopAdapter(),
      requeuer: new bg.JobRequeuerNoopAdapter(),
      serializer: new bg.PayloadSerializerJsonAdapter(),
    }),
    [bg.NodeEnvironmentEnum.staging]: JobQueue,
    [bg.NodeEnvironmentEnum.production]: JobQueue,
  }[Env.type];
}
