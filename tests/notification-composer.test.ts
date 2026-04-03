import { describe, expect, test } from "bun:test";
import * as bg from "@bgord/bun";
import * as v from "valibot";
import * as Notifier from "+notifier";
import * as mocks from "./mocks";

describe("NotificationComposerChooser", () => {
  test("kind - success", () => {
    const composer = Notifier.Services.NotificationComposer.success.compose(mocks.subject, mocks.content);

    expect(composer).toEqual({
      subject: v.parse(bg.MailerSubject, `✅ [SUCCESS] ${mocks.subject}`),
      html: mocks.content,
    });
  });

  test("kind - error", () => {
    const composer = Notifier.Services.NotificationComposer.error.compose(mocks.subject, mocks.content);

    expect(composer).toEqual({
      subject: v.parse(bg.MailerSubject, `❌ [ERROR] ${mocks.subject}`),
      html: mocks.content,
    });
  });

  test("kind - info", () => {
    const composer = Notifier.Services.NotificationComposer.info.compose(mocks.subject, mocks.content);

    expect(composer).toEqual({
      subject: v.parse(bg.MailerSubject, `ℹ️  [INFO] ${mocks.subject}`),
      html: mocks.content,
    });
  });
});
