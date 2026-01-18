import * as bg from "@bgord/bun";
import type * as tools from "@bgord/tools";
import type { NotificationComposerStrategy } from "./notification-composer";

export class Notification {
  constructor(
    private readonly EMAIL_FROM: tools.EmailType,
    private readonly subject: bg.MailerSubjectType,
    private readonly content: bg.MailerContentHtmlType,
    private readonly deps: { Mailer: bg.MailerPort },
  ) {}

  async compose(strategy: NotificationComposerStrategy): Promise<bg.MailerTemplateMessage> {
    return strategy.compose(this.subject, this.content);
  }

  async send(message: bg.MailerTemplateMessage, to: tools.EmailType) {
    const template = new bg.MailerTemplate({ from: this.EMAIL_FROM, to }, message);

    return this.deps.Mailer.send(template);
  }
}
