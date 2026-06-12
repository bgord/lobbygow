import * as bg from "@bgord/bun";
import type * as tools from "@bgord/tools";
import type hono from "hono";
import * as v from "valibot";
import * as Notifier from "+notifier";

type Config = { EMAIL_FROM: tools.EmailType; EMAIL_TO: tools.EmailType };

type Dependencies = {
  IdProvider: bg.IdProviderPort;
  Clock: bg.ClockPort;
  JobQueue: bg.JobQueuePort<bg.System.Jobs.SendEmailJobType>;
};

export const NotificationSend =
  (config: Config, deps: Dependencies) => async (c: hono.Context, _next: hono.Next) => {
    const body = await c.req.json();

    const subject = v.parse(bg.MailerSubject, body.subject);
    const content = v.parse(bg.MailerContentHtml, body.content);
    const kind = v.parse(Notifier.VO.NotificationKind, body.kind);

    const message = Notifier.Services.NotificationComposer[kind].compose(subject, content);

    const job = bg.job(
      bg.System.Jobs.SendEmailJobSchema,
      { ...message, from: config.EMAIL_FROM, to: config.EMAIL_TO },
      deps,
    );

    await deps.JobQueue.enqueue(job);

    return new Response();
  };
