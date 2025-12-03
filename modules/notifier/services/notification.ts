import type * as bg from "@bgord/bun";
import type * as tools from "@bgord/tools";
import type { NotificationComposerStrategy } from "./notification-composer";

export class Notification {
  constructor(
    private readonly EMAIL_FROM: bg.EmailFromType,
    private readonly subject: bg.EmailSubjectType,
    private readonly content: bg.EmailContentHtmlType,
    private readonly deps: { Mailer: bg.MailerPort },
  ) {}

  async compose(strategy: NotificationComposerStrategy): Promise<tools.NotificationTemplate> {
    return strategy.compose(this.subject, this.content);
  }

  async send(message: tools.NotificationTemplate, to: bg.EmailToType) {
    return this.deps.Mailer.send({ from: this.EMAIL_FROM, to, ...message.get() });
  }
}
