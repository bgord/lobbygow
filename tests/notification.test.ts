import { describe, expect, jest, spyOn, test } from "bun:test";
import * as Notifier from "+notifier";
import { Env } from "+infra/env";
import { Mailer } from "+infra/mailer.adapter";

const subject = "subject";
const content = "content";

const deps = { Mailer };

const notification = new Notifier.Services.Notification(Env.EMAIL_FROM, subject, content, deps);

describe("Notification", () => {
  describe("compose", () => {
    test("kind - success", async () => {
      const composer = Notifier.Services.NotificationComposerChooser.choose(
        Notifier.VO.NotificationKindEnum.success,
      );

      const message = await notification.compose(composer);

      expect(composer).toBeInstanceOf(Notifier.Services.NotificationComposerSuccess);
      expect(message.get()).toEqual({ subject: `✅ [SUCCESS] ${subject}`, html: content });
    });

    test("kind - error", async () => {
      const composer = Notifier.Services.NotificationComposerChooser.choose(
        Notifier.VO.NotificationKindEnum.error,
      );

      const message = await notification.compose(composer);

      expect(composer).toBeInstanceOf(Notifier.Services.NotificationComposerError);
      expect(message.get()).toEqual({ subject: `❌ [ERROR] ${subject}`, html: content });
    });

    test("kind - info", async () => {
      const composer = Notifier.Services.NotificationComposerChooser.choose(
        Notifier.VO.NotificationKindEnum.info,
      );

      const message = await notification.compose(composer);

      expect(composer).toBeInstanceOf(Notifier.Services.NotificationComposerInfo);
      expect(message.get()).toEqual({ subject: `ℹ️  [INFO] ${subject}`, html: content });
    });
  });

  describe("send", () => {
    test("kind - success", async () => {
      const mailerSend = spyOn(Mailer, "send").mockImplementation(jest.fn());

      const composer = Notifier.Services.NotificationComposerChooser.choose(
        Notifier.VO.NotificationKindEnum.success,
      );

      const message = await notification.compose(composer);

      await notification.send(message, Env.EMAIL_TO);

      expect(mailerSend).toHaveBeenCalledWith({
        from: Env.EMAIL_FROM,
        to: Env.EMAIL_TO,
        subject: `✅ [SUCCESS] ${subject}`,
        html: content,
      });
    });

    test("kind - error", async () => {
      const mailerSend = spyOn(Mailer, "send").mockImplementation(jest.fn());

      const composer = Notifier.Services.NotificationComposerChooser.choose(
        Notifier.VO.NotificationKindEnum.error,
      );

      const message = await notification.compose(composer);

      await notification.send(message, Env.EMAIL_TO);

      expect(mailerSend).toHaveBeenCalledWith({
        from: Env.EMAIL_FROM,
        to: Env.EMAIL_TO,
        subject: `❌ [ERROR] ${subject}`,
        html: content,
      });
    });

    test("kind - info", async () => {
      const mailerSend = spyOn(Mailer, "send").mockImplementation(jest.fn());

      const composer = Notifier.Services.NotificationComposerChooser.choose(
        Notifier.VO.NotificationKindEnum.info,
      );

      const message = await notification.compose(composer);

      await notification.send(message, Env.EMAIL_TO);

      expect(mailerSend).toHaveBeenCalledWith({
        from: Env.EMAIL_FROM,
        to: Env.EMAIL_TO,
        subject: `ℹ️  [INFO] ${subject}`,
        html: content,
      });
    });
  });
});
