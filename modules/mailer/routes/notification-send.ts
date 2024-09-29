import * as bg from "@bgord/node";
import express from "express";

import * as infra from "../../../infra";
import * as VO from "../value-objects";
import * as Services from "../services";

export async function NotificationSend(
  request: express.Request,
  response: express.Response,
  _next: express.NextFunction,
) {
  const subject = bg.Schema.EmailSubject.parse(request.body.subject);
  const content = bg.Schema.EmailContentHtml.parse(request.body.content);
  const kind = VO.NotificationKind.parse(request.body.kind);

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

  const result = await notification.send(message, infra.Env.EMAIL_TO);

  infra.logger.info({
    message: "Notification sent",
    operation: "notification_sent_result",
    metadata: { result },
  });

  response.status(200).send();
}
