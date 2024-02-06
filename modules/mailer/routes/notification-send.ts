import * as bg from "@bgord/node";
import express from "express";

import * as infra from "../../../infra";
import * as Services from "../services";

export async function NotificationSend(
  request: express.Request,
  response: express.Response,
  _next: express.NextFunction
) {
  const subject = bg.Schema.EmailSubject.parse(request.body.subject);
  const content = bg.Schema.EmailContentHtml.parse(request.body.content);

  const notification = new Services.Notification(subject, content);
  const message = await notification.compose();

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

  return response.status(200).send();
}
