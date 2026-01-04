import type * as bg from "@bgord/bun";
import type * as tools from "@bgord/tools";
import type { NotificationComposerStrategy } from "./notification-composer";

export class Notification {
  constructor(
    private readonly EMAIL_FROM: tools.EmailType,
    private readonly subject: bg.MailerSubjectType,
    private readonly content: bg.MailerContentHtmlType,
    private readonly deps: { Mailer: bg.MailerPort },
  ) {}

  async compose(strategy: NotificationComposerStrategy): Promise<tools.NotificationTemplate> {
    return strategy.compose(this.subject, this.content);
  }

  async send(message: tools.NotificationTemplate, to: tools.EmailType) {
    return this.deps.Mailer.send({ from: this.EMAIL_FROM, to, ...message.get() });
  }
}
