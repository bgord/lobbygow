import * as bg from "@bgord/bun";
import * as VO from "../value-objects";

export abstract class NotificationComposerStrategy {
  abstract strategy: string;

  abstract compose(
    subject: bg.MailerSubjectType,
    content: bg.MailerContentHtmlType,
  ): Promise<bg.MailerTemplateMessage>;
}

export class NotificationComposerChooser {
  static choose(kind: VO.NotificationKindEnum): NotificationComposerStrategy {
    const strategies = [NotificationComposerSuccess, NotificationComposerInfo, NotificationComposerError];

    const NotificationComposerStrategy =
      strategies.find((strategy) => strategy.isApplicable(kind)) ?? NotificationComposerInfo;

    return new NotificationComposerStrategy();
  }
}

/** @public */
export class NotificationComposerError implements NotificationComposerStrategy {
  strategy = "error";

  static isApplicable(kind: VO.NotificationKindEnum) {
    return kind === VO.NotificationKindEnum.error;
  }

  async compose(
    subject: bg.MailerSubjectType,
    html: bg.MailerContentHtmlType,
  ): Promise<bg.MailerTemplateMessage> {
    return { subject: bg.MailerSubject.parse(`❌ [ERROR] ${subject}`), html };
  }
}

/** @public */
export class NotificationComposerInfo implements NotificationComposerStrategy {
  strategy = "info";

  static isApplicable(kind: VO.NotificationKindEnum) {
    return kind === VO.NotificationKindEnum.info;
  }

  async compose(
    subject: bg.MailerSubjectType,
    html: bg.MailerContentHtmlType,
  ): Promise<bg.MailerTemplateMessage> {
    return { subject: bg.MailerSubject.parse(`ℹ️  [INFO] ${subject}`), html };
  }
}

/** @public */
export class NotificationComposerSuccess implements NotificationComposerStrategy {
  strategy = "success";

  static isApplicable(kind: VO.NotificationKindEnum) {
    return kind === VO.NotificationKindEnum.success;
  }

  async compose(
    subject: bg.MailerSubjectType,
    html: bg.MailerContentHtmlType,
  ): Promise<bg.MailerTemplateMessage> {
    return { subject: bg.MailerSubject.parse(`✅ [SUCCESS] ${subject}`), html };
  }
}
