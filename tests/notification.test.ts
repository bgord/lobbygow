import { describe, expect, jest, spyOn, test } from "bun:test";

import * as infra from "../infra";
import { Notification } from "../modules/mailer/services/notification";
import {
  NotificationComposerChooser,
  NotificationComposerError,
  NotificationComposerInfo,
  NotificationComposerSuccess,
} from "../modules/mailer/services/notification-composer";
import { NotificationKindEnum } from "../modules/mailer/value-objects/notification-kind-enum";

const subject = "subject";
const content = "content";

const notification = new Notification(subject, content);

describe("Notification", () => {
  describe("compose", () => {
    test("kind - success", async () => {
      const composer = NotificationComposerChooser.choose(NotificationKindEnum.success);

      const message = await notification.compose(composer);

      expect(composer).toBeInstanceOf(NotificationComposerSuccess);
      expect(message).toEqual({ subject: `✅ [SUCCESS] ${subject}`, content });
    });

    test("kind - error", async () => {
      const composer = NotificationComposerChooser.choose(NotificationKindEnum.error);

      const message = await notification.compose(composer);

      expect(composer).toBeInstanceOf(NotificationComposerError);
      expect(message).toEqual({ subject: `❌ [ERROR] ${subject}`, content });
    });

    test("kind - info", async () => {
      const composer = NotificationComposerChooser.choose(NotificationKindEnum.info);

      const message = await notification.compose(composer);

      expect(composer).toBeInstanceOf(NotificationComposerInfo);
      expect(message).toEqual({ subject: `ℹ️  [INFO] ${subject}`, content });
    });
  });

  describe("send", () => {
    test("kind - success", async () => {
      const infraMailerSend = spyOn(infra.Mailer, "send").mockImplementation(jest.fn());

      const composer = NotificationComposerChooser.choose(NotificationKindEnum.success);

      const message = await notification.compose(composer);

      await notification.send(message, infra.Env.EMAIL_TO);

      expect(infraMailerSend).toHaveBeenCalledWith({
        from: infra.Env.EMAIL_FROM,
        to: infra.Env.EMAIL_TO,
        subject: `✅ [SUCCESS] ${subject}`,
        content,
      });
    });

    test("kind - error", async () => {
      const infraMailerSend = spyOn(infra.Mailer, "send").mockImplementation(jest.fn());

      const composer = NotificationComposerChooser.choose(NotificationKindEnum.error);

      const message = await notification.compose(composer);

      await notification.send(message, infra.Env.EMAIL_TO);

      expect(infraMailerSend).toHaveBeenCalledWith({
        from: infra.Env.EMAIL_FROM,
        to: infra.Env.EMAIL_TO,
        subject: `❌ [ERROR] ${subject}`,
        content,
      });
    });

    test("kind - info", async () => {
      const infraMailerSend = spyOn(infra.Mailer, "send").mockImplementation(jest.fn());

      const composer = NotificationComposerChooser.choose(NotificationKindEnum.info);

      const message = await notification.compose(composer);

      await notification.send(message, infra.Env.EMAIL_TO);

      expect(infraMailerSend).toHaveBeenCalledWith({
        from: infra.Env.EMAIL_FROM,
        to: infra.Env.EMAIL_TO,
        subject: `ℹ️  [INFO] ${subject}`,
        content,
      });
    });
  });
});
