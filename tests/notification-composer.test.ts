import { describe, expect, test } from "bun:test";
import {
  NotificationComposerChooser,
  NotificationComposerError,
  NotificationComposerInfo,
  NotificationComposerSuccess,
} from "../modules/mailer/services/notification-composer";
import { NotificationKindEnum } from "../modules/mailer/value-objects/notification-kind-enum";

describe("NotificationComposerChooser", () => {
  test("kind - success", () => {
    const composer = NotificationComposerChooser.choose(NotificationKindEnum.success);

    expect(composer).toBeInstanceOf(NotificationComposerSuccess);
  });

  test("kind - error", () => {
    const composer = NotificationComposerChooser.choose(NotificationKindEnum.error);

    expect(composer).toBeInstanceOf(NotificationComposerError);
  });

  test("kind - info", () => {
    const composer = NotificationComposerChooser.choose(NotificationKindEnum.info);

    expect(composer).toBeInstanceOf(NotificationComposerInfo);
  });
});
