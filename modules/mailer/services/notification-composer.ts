import * as bg from "@bgord/bun";
import * as VO from "../value-objects";
import type { MessageType } from "./notification";

export abstract class NotificationComposerStrategy {
  abstract strategy: string;

  abstract compose(subject: bg.EmailSubjectType, content: bg.EmailContentHtmlType): Promise<MessageType>;
}

export class NotificationComposerChooser {
  static choose(kind: VO.NotificationKindEnum): NotificationComposerStrategy {
    const strategies = [NotificationComposerSuccess, NotificationComposerInfo, NotificationComposerError];

    const NotificationComposerStrategy =
      strategies.find((strategy) => strategy.isApplicable(kind)) ?? NotificationComposerInfo;

    return new NotificationComposerStrategy();
  }
}

class NotificationComposerError implements NotificationComposerStrategy {
  strategy = "error";

  static isApplicable(kind: VO.NotificationKindEnum) {
    return kind === VO.NotificationKindEnum.error;
  }

  async compose(subject: bg.EmailSubjectType, content: bg.EmailContentHtmlType) {
    return {
      subject: bg.EmailSubject.parse(`❌ [ERROR] ${subject}`),
      content,
    };
  }
}

class NotificationComposerInfo implements NotificationComposerStrategy {
  strategy = "info";

  static isApplicable(kind: VO.NotificationKindEnum) {
    return kind === VO.NotificationKindEnum.info;
  }

  async compose(subject: bg.EmailSubjectType, content: bg.EmailContentHtmlType) {
    return {
      subject: bg.EmailSubject.parse(`ℹ️  [INFO] ${subject}`),
      content,
    };
  }
}

class NotificationComposerSuccess implements NotificationComposerStrategy {
  strategy = "success";

  static isApplicable(kind: VO.NotificationKindEnum) {
    return kind === VO.NotificationKindEnum.success;
  }

  async compose(subject: bg.EmailSubjectType, content: bg.EmailContentHtmlType) {
    return {
      subject: bg.EmailSubject.parse(`✅ [SUCCESS] ${subject}`),
      content,
    };
  }
}
