import { describe, expect, jest, spyOn, test } from "bun:test";
import * as Notifier from "+notifier";
import { bootstrap } from "+infra/bootstrap";

const subject = "subject";
const content = "content";

describe("Notification", async () => {
  const di = await bootstrap();
  const config = { from: di.Env.EMAIL_FROM, to: di.Env.EMAIL_TO };

  describe("compose", () => {
    test("kind - success", async () => {
      const composer = Notifier.Services.NotificationComposerChooser.choose(
        Notifier.VO.NotificationKindEnum.success,
      );
      const notification = new Notifier.Services.Notification(
        di.Env.EMAIL_FROM,
        subject,
        content,
        di.Adapters.System,
      );

      const message = await notification.compose(composer);

      expect(composer).toBeInstanceOf(Notifier.Services.NotificationComposerSuccess);
      expect(message).toEqual({ subject: `✅ [SUCCESS] ${subject}`, html: content });
    });

    test("kind - error", async () => {
      const composer = Notifier.Services.NotificationComposerChooser.choose(
        Notifier.VO.NotificationKindEnum.error,
      );
      const notification = new Notifier.Services.Notification(
        di.Env.EMAIL_FROM,
        subject,
        content,
        di.Adapters.System,
      );

      const message = await notification.compose(composer);

      expect(composer).toBeInstanceOf(Notifier.Services.NotificationComposerError);
      expect(message).toEqual({ subject: `❌ [ERROR] ${subject}`, html: content });
    });

    test("kind - info", async () => {
      const composer = Notifier.Services.NotificationComposerChooser.choose(
        Notifier.VO.NotificationKindEnum.info,
      );
      const notification = new Notifier.Services.Notification(
        di.Env.EMAIL_FROM,
        subject,
        content,
        di.Adapters.System,
      );

      const message = await notification.compose(composer);

      expect(composer).toBeInstanceOf(Notifier.Services.NotificationComposerInfo);
      expect(message).toEqual({ subject: `ℹ️  [INFO] ${subject}`, html: content });
    });
  });

  describe("send", () => {
    test("kind - success", async () => {
      const mailerSend = spyOn(di.Adapters.System.Mailer, "send").mockImplementation(jest.fn());
      const composer = Notifier.Services.NotificationComposerChooser.choose(
        Notifier.VO.NotificationKindEnum.success,
      );
      const notification = new Notifier.Services.Notification(
        di.Env.EMAIL_FROM,
        subject,
        content,
        di.Adapters.System,
      );
      const message = await notification.compose(composer);

      await notification.send(message, di.Env.EMAIL_TO);

      expect(mailerSend).toHaveBeenCalledWith({
        config,
        message: { subject: `✅ [SUCCESS] ${subject}`, html: content },
      });
    });

    test("kind - error", async () => {
      const mailerSend = spyOn(di.Adapters.System.Mailer, "send").mockImplementation(jest.fn());
      const composer = Notifier.Services.NotificationComposerChooser.choose(
        Notifier.VO.NotificationKindEnum.error,
      );
      const notification = new Notifier.Services.Notification(
        di.Env.EMAIL_FROM,
        subject,
        content,
        di.Adapters.System,
      );
      const message = await notification.compose(composer);

      await notification.send(message, di.Env.EMAIL_TO);

      expect(mailerSend).toHaveBeenCalledWith({
        config,
        message: { subject: `❌ [ERROR] ${subject}`, html: content },
      });
    });

    test("kind - info", async () => {
      const mailerSend = spyOn(di.Adapters.System.Mailer, "send").mockImplementation(jest.fn());
      const composer = Notifier.Services.NotificationComposerChooser.choose(
        Notifier.VO.NotificationKindEnum.info,
      );
      const notification = new Notifier.Services.Notification(
        di.Env.EMAIL_FROM,
        subject,
        content,
        di.Adapters.System,
      );
      const message = await notification.compose(composer);

      await notification.send(message, di.Env.EMAIL_TO);

      expect(mailerSend).toHaveBeenCalledWith({
        config,
        message: { subject: `ℹ️  [INFO] ${subject}`, html: content },
      });
    });
  });
});
