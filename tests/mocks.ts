import { expect } from "bun:test";
import * as bg from "@bgord/bun";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import * as Notifier from "+notifier";

export const expectAnyId = expect.stringMatching(
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
);

export const correlationId = "00000000-0000-0000-0000-000000000000";

export const T0 = tools.Timestamp.fromNumber(Date.UTC(2025, 0, 1, 0, 0, 0));

export const ip = { server: { requestIP: () => ({ address: "127.0.0.1", family: "foo", port: "123" }) } };

export const subject = v.parse(bg.MailerSubject, "subject");
export const content = v.parse(bg.MailerContentHtml, "content");

export const notification = { subject, content };

export const GenericSendEmailJobInfo = {
  id: expectAnyId,
  correlationId: correlationId,
  createdAt: T0.ms,
  name: Notifier.Jobs.SEND_EMAIL_JOB,
  revision: 0,
  payload: {
    subject: v.parse(bg.MailerSubject, `ℹ️  [INFO] ${subject}`),
    html: content,
    to: v.parse(tools.Email, "abc@example.com"),
    from: v.parse(tools.Email, "abc@example.com"),
  },
} satisfies Notifier.Jobs.SendEmailJobType;

export const GenericSendEmailJobError = {
  id: expectAnyId,
  correlationId: correlationId,
  createdAt: T0.ms,
  name: Notifier.Jobs.SEND_EMAIL_JOB,
  revision: 0,
  payload: {
    subject: v.parse(bg.MailerSubject, `❌ [ERROR] ${subject}`),
    html: content,
    to: v.parse(tools.Email, "abc@example.com"),
    from: v.parse(tools.Email, "abc@example.com"),
  },
} satisfies Notifier.Jobs.SendEmailJobType;

export const GenericSendEmailJobSuccess = {
  id: expectAnyId,
  correlationId: correlationId,
  createdAt: T0.ms,
  name: Notifier.Jobs.SEND_EMAIL_JOB,
  revision: 0,
  payload: {
    subject: v.parse(bg.MailerSubject, `✅ [SUCCESS] ${subject}`),
    html: content,
    to: v.parse(tools.Email, "abc@example.com"),
    from: v.parse(tools.Email, "abc@example.com"),
  },
} satisfies Notifier.Jobs.SendEmailJobType;

export const correlationIdHeaders = { "correlation-id": correlationId };
