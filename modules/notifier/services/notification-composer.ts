import * as bg from "@bgord/bun";
import * as v from "valibot";
import * as VO from "+notifier/value-objects";

class NotificationComposerPrefixed {
  constructor(private readonly prefix: string) {}

  compose(subject: bg.MailerSubjectType, content: bg.MailerContentHtmlType): bg.MailerTemplateMessage {
    return { subject: v.parse(bg.MailerSubject, `${this.prefix} ${subject}`), html: content };
  }
}

export const NotificationComposer: Record<VO.NotificationKindEnum, NotificationComposerPrefixed> = {
  [VO.NotificationKindEnum.info]: new NotificationComposerPrefixed("ℹ️  [INFO]"),
  [VO.NotificationKindEnum.error]: new NotificationComposerPrefixed("❌ [ERROR]"),
  [VO.NotificationKindEnum.success]: new NotificationComposerPrefixed("✅ [SUCCESS]"),
};
