import * as bg from "@bgord/node";
import * as VO from "../value-objects";
import type { MessageType } from "./notification";

export abstract class NotificationComposerStrategy {
  abstract strategy: string;

  abstract compose(
    subject: bg.Schema.EmailSubjectType,
    content: bg.Schema.EmailContentHtmlType,
  ): Promise<MessageType>;
}

export class NotificationComposerChooser {
  static choose(kind: VO.NotificationKindEnum): NotificationComposerStrategy {
    const strategies = [
      NotificationComposerSuccess,
      NotificationComposerInfo,
      NotificationComposerError,
      NotificationComposerDefault,
    ];

    const NotificationComposerStrategy =
      strategies.find((strategy) => strategy.isApplicable(kind)) ?? NotificationComposerDefault;

    return new NotificationComposerStrategy();
  }
}

class NotificationComposerDefault implements NotificationComposerStrategy {
  strategy = "default";

  static isApplicable() {
    return true;
  }

  async compose(subject: bg.Schema.EmailSubjectType, content: bg.Schema.EmailContentHtmlType) {
    return { subject, content };
  }
}

class NotificationComposerError implements NotificationComposerStrategy {
  strategy = "error";

  static isApplicable(kind: VO.NotificationKindEnum) {
    return kind === VO.NotificationKindEnum.error;
  }

  async compose(subject: bg.Schema.EmailSubjectType, content: bg.Schema.EmailContentHtmlType) {
    return {
      subject: bg.Schema.EmailSubject.parse(`❌ [ERROR] ${subject}`),
      content,
    };
  }
}

class NotificationComposerInfo implements NotificationComposerStrategy {
  strategy = "info";

  static isApplicable(kind: VO.NotificationKindEnum) {
    return kind === VO.NotificationKindEnum.info;
  }

  async compose(subject: bg.Schema.EmailSubjectType, content: bg.Schema.EmailContentHtmlType) {
    return {
      subject: bg.Schema.EmailSubject.parse(`ℹ️  [INFO] ${subject}`),
      content,
    };
  }
}

class NotificationComposerSuccess implements NotificationComposerStrategy {
  strategy = "success";

  static isApplicable(kind: VO.NotificationKindEnum) {
    return kind === VO.NotificationKindEnum.success;
  }

  async compose(subject: bg.Schema.EmailSubjectType, content: bg.Schema.EmailContentHtmlType) {
    return {
      subject: bg.Schema.EmailSubject.parse(`✅ [SUCCESS] ${subject}`),
      content,
    };
  }
}
