import * as bg from "@bgord/bun";
import type hono from "hono";
import * as v from "valibot";
import * as Notifier from "+notifier";
import type { EnvironmentResultType } from "+infra/env";

type Dependencies = {
  IdProvider: bg.IdProviderPort;
  Clock: bg.ClockPort;
  JobQueue: bg.JobQueuePort<Notifier.Jobs.SendEmailJobType>;
};

export const NotificationSend =
  (Env: EnvironmentResultType, deps: Dependencies) => async (c: hono.Context, _next: hono.Next) => {
    const body = await c.req.json();

    const subject = v.parse(bg.MailerSubject, body.subject);
    const content = v.parse(bg.MailerContentHtml, body.content);
    const kind = v.parse(Notifier.VO.NotificationKind, body.kind);

    const message = Notifier.Services.NotificationComposer[kind].compose(subject, content);

    const job = bg.job(
      Notifier.Jobs.SendEmailJobSchema,
      { ...message, from: Env.EMAIL_FROM, to: Env.EMAIL_TO },
      deps,
    );

    await deps.JobQueue.enqueue(job);

    return new Response();
  };
