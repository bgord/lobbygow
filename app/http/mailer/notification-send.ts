import * as bg from "@bgord/bun";
import type hono from "hono";
import * as Notifier from "+notifier";
import { Env } from "+infra/env";
import { logger } from "+infra/logger.adapter";

export async function NotificationSend(c: hono.Context, _next: hono.Next) {
  const body = await bg.safeParseBody(c);

  const subject = bg.EmailSubject.parse(body.subject);
  const content = bg.EmailContentHtml.parse(body.content);
  const kind = Notifier.VO.NotificationKind.parse(body.kind);

  const notification = new Notifier.Services.Notification(subject, content);
  const composer = Notifier.Services.NotificationComposerChooser.choose(kind);

  logger.info({
    message: "Notification composer chosen",
    component: "http",
    operation: "notification_composer_chosen",
    metadata: { name: composer.strategy },
  });

  const message = await notification.compose(composer);

  logger.info({
    message: "Notification composed",
    component: "http",
    operation: "notification_composed_content",
    metadata: { message },
  });

  const result = await notification.send(message, Env.EMAIL_TO);

  logger.info({
    message: "Notification sent",
    component: "http",
    operation: "notification_sent_result",
    metadata: { result },
  });

  return new Response();
}
