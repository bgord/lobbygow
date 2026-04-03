import * as bg from "@bgord/bun";
import * as v from "valibot";
import * as VO from "+notifier/value-objects";

interface NotificationComposerStrategy {
  compose(subject: bg.MailerSubjectType, content: bg.MailerContentHtmlType): bg.MailerTemplateMessage;
}

class NotificationComposerError implements NotificationComposerStrategy {
  compose(subject: bg.MailerSubjectType, content: bg.MailerContentHtmlType): bg.MailerTemplateMessage {
    return { subject: v.parse(bg.MailerSubject, `❌ [ERROR] ${subject}`), html: content };
  }
}

class NotificationComposerInfo implements NotificationComposerStrategy {
  compose(subject: bg.MailerSubjectType, content: bg.MailerContentHtmlType): bg.MailerTemplateMessage {
    return { subject: v.parse(bg.MailerSubject, `ℹ️  [INFO] ${subject}`), html: content };
  }
}

class NotificationComposerSuccess implements NotificationComposerStrategy {
  compose(subject: bg.MailerSubjectType, content: bg.MailerContentHtmlType): bg.MailerTemplateMessage {
    return { subject: v.parse(bg.MailerSubject, `✅ [SUCCESS] ${subject}`), html: content };
  }
}

export const NotificationComposer: Record<VO.NotificationKindEnum, NotificationComposerStrategy> = {
  [VO.NotificationKindEnum.info]: new NotificationComposerInfo(),
  [VO.NotificationKindEnum.error]: new NotificationComposerError(),
  [VO.NotificationKindEnum.success]: new NotificationComposerSuccess(),
};
