import * as bg from "@bgord/node";
import * as infra from "../../../infra";
import { NotificationComposerStrategy } from "./notification-composer";

export type MessageType = {
  subject: bg.Schema.EmailSubjectType;
  content: bg.Schema.EmailContentHtmlType;
};

export class Notification {
  constructor(
    private readonly subject: bg.Schema.EmailSubjectType,
    private readonly content: bg.Schema.EmailContentHtmlType,
  ) {}

  async compose(strategy: NotificationComposerStrategy): Promise<MessageType> {
    return strategy.compose(this.subject, this.content);
  }

  async send(message: MessageType, to: bg.Schema.EmailToType) {
    return infra.Mailer.send({ from: infra.Env.EMAIL_FROM, to, ...message });
  }
}
