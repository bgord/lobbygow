import type * as bg from "@bgord/bun";
import type * as tools from "@bgord/tools";
import { Env } from "+infra/env";
import { Mailer } from "+infra/mailer.adapter";
import type { NotificationComposerStrategy } from "./notification-composer";

export class Notification {
  constructor(
    private readonly subject: bg.EmailSubjectType,
    private readonly content: bg.EmailContentHtmlType,
  ) {}

  async compose(strategy: NotificationComposerStrategy): Promise<tools.NotificationTemplate> {
    return strategy.compose(this.subject, this.content);
  }

  async send(message: tools.NotificationTemplate, to: bg.EmailToType) {
    return Mailer.send({ from: Env.EMAIL_FROM, to, ...message });
  }
}
