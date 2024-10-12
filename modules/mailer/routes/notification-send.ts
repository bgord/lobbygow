import hono from "hono";
import * as bg from "@bgord/node";

import * as infra from "../../../infra";
import * as VO from "../value-objects";
import * as Services from "../services";

export async function NotificationSend(c: hono.Context, _next: hono.Next) {
  const body = await c.req.json();

  const subject = bg.Schema.EmailSubject.parse(body.subject);
  const content = bg.Schema.EmailContentHtml.parse(body.content);
  const kind = VO.NotificationKind.parse(body.kind);

  const notification = new Services.Notification(subject, content);
  const composer = Services.NotificationComposerChooser.choose(kind);

  infra.logger.info({
    message: "Notification composer chosen",
    operation: "notification_composer_chosen",
    metadata: { name: composer.strategy },
  });

  const message = await notification.compose(composer);

  infra.logger.info({
    message: "Notification composed",
    operation: "notification_composed_content",
    metadata: { message },
  });

  if (infra.Env.type === bg.Schema.NodeEnvironmentEnum.production) {
    const result = await notification.send(message, infra.Env.EMAIL_TO);

    infra.logger.info({
      message: "Notification sent",
      operation: "notification_sent_result",
      metadata: { result },
    });
  }

  return new Response();
}
