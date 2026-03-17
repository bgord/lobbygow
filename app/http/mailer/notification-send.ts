import * as bg from "@bgord/bun";
import type hono from "hono";
import * as v from "valibot";
import * as Notifier from "+notifier";
import type { bootstrap } from "+infra/bootstrap";

export const NotificationSend =
  (di: Awaited<ReturnType<typeof bootstrap>>) => async (c: hono.Context, _next: hono.Next) => {
    const body = await c.req.json();

    const subject = v.parse(bg.MailerSubject, body.subject);
    const content = v.parse(bg.MailerContentHtml, body.content);
    const kind = v.parse(Notifier.VO.NotificationKind, body.kind);

    const notification = new Notifier.Services.Notification(
      di.Env.EMAIL_FROM,
      subject,
      content,
      di.Adapters.System,
    );
    const composer = Notifier.Services.NotificationComposerChooser.choose(kind);

    di.Adapters.System.Logger.info({
      message: "Notification composer chosen",
      component: "http",
      operation: "notification_composer_chosen",
      metadata: { name: composer.strategy },
    });

    const message = await notification.compose(composer);

    di.Adapters.System.Logger.info({
      message: "Notification composed",
      component: "http",
      operation: "notification_composed_content",
      metadata: { message },
    });

    const result = await notification.send(message, di.Env.EMAIL_TO);

    di.Adapters.System.Logger.info({
      message: "Notification sent",
      component: "http",
      operation: "notification_sent_result",
      metadata: { result },
    });

    return new Response();
  };
