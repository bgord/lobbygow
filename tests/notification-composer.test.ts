import { describe, expect, test } from "bun:test";
import * as Notifier from "+notifier";

describe("NotificationComposerChooser", () => {
  test("kind - success", () => {
    const composer = Notifier.Services.NotificationComposerChooser.choose(
      Notifier.VO.NotificationKindEnum.success,
    );

    expect(composer).toBeInstanceOf(Notifier.Services.NotificationComposerSuccess);
  });

  test("kind - error", () => {
    const composer = Notifier.Services.NotificationComposerChooser.choose(
      Notifier.VO.NotificationKindEnum.error,
    );

    expect(composer).toBeInstanceOf(Notifier.Services.NotificationComposerError);
  });

  test("kind - info", () => {
    const composer = Notifier.Services.NotificationComposerChooser.choose(
      Notifier.VO.NotificationKindEnum.info,
    );

    expect(composer).toBeInstanceOf(Notifier.Services.NotificationComposerInfo);
  });
});
