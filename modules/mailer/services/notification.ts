import * as bg from "@bgord/node";

import * as infra from "../../../infra";

type MessageType = {
  subject: bg.Schema.EmailSubjectType;
  content: bg.Schema.EmailContentHtmlType;
};

export class Notification {
  constructor(
    private readonly subject: bg.Schema.EmailSubjectType,
    private readonly content: bg.Schema.EmailContentHtmlType,
  ) {}

  async compose(): Promise<MessageType> {
    return { subject: this.subject, content: this.content };
  }

  async send(message: MessageType, to: bg.Schema.EmailToType): Promise<void> {
    await infra.Mailer.send({ from: infra.Env.EMAIL_FROM, to, ...message });
  }
}
