import type * as bg from "@bgord/bun";
import * as infra from "../../../infra";
import type { NotificationComposerStrategy } from "./notification-composer";

export type MessageType = {
  subject: bg.EmailSubjectType;
  content: bg.EmailContentHtmlType;
};

export class Notification {
  constructor(
    private readonly subject: bg.EmailSubjectType,
    private readonly content: bg.EmailContentHtmlType,
  ) {}

  async compose(strategy: NotificationComposerStrategy): Promise<MessageType> {
    return strategy.compose(this.subject, this.content);
  }

  async send(message: MessageType, to: bg.EmailToType) {
    return infra.Mailer.send({ from: infra.Env.EMAIL_FROM, to, ...message });
  }
}
