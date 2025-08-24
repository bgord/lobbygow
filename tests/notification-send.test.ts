import { describe, expect, jest, spyOn, test } from "bun:test";
import * as bgb from "@bgord/bun";
import * as Notifier from "+notifier";
import { Mailer } from "+infra/mailer.adapter";
import { Env } from "../infra/env";
import { server } from "../server";

const ip = {
  server: {
    requestIP: () => ({ address: "127.0.0.1", family: "foo", port: "123" }),
  },
};

describe("POST /notification-send", () => {
  test("validation - empty payload", async () => {
    const response = await server.request(
      "/notification-send",
      {
        method: "POST",
        headers: new Headers({ [bgb.ShieldApiKey.HEADER_NAME]: Env.API_KEY }),
      },
      ip,
    );

    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({ message: "payload.invalid.error", _known: true });
  });

  test("validation - invalid payload", async () => {
    const response = await server.request(
      "/notification-send",
      {
        method: "POST",
        body: "invalid-json",
        headers: new Headers({ [bgb.ShieldApiKey.HEADER_NAME]: Env.API_KEY }),
      },
      ip,
    );

    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({ message: "payload.invalid.error", _known: true });
  });

  test("validation - missing subject", async () => {
    const response = await server.request(
      "/notification-send",
      {
        method: "POST",
        body: JSON.stringify({ content: "content", kind: Notifier.VO.NotificationKindEnum.info }),
        headers: new Headers({ [bgb.ShieldApiKey.HEADER_NAME]: Env.API_KEY }),
      },
      ip,
    );

    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({ message: "payload.invalid.error", _known: true });
  });

  test("validation - missing content", async () => {
    const response = await server.request(
      "/notification-send",
      {
        method: "POST",
        body: JSON.stringify({ subject: "subject", kind: Notifier.VO.NotificationKindEnum.info }),
        headers: new Headers({ [bgb.ShieldApiKey.HEADER_NAME]: Env.API_KEY }),
      },
      ip,
    );

    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({ message: "payload.invalid.error", _known: true });
  });

  test("happy path - info", async () => {
    const mailerSend = spyOn(Mailer, "send").mockImplementation(jest.fn());

    const payload = {
      subject: "subject",
      content: "content",
      kind: Notifier.VO.NotificationKindEnum.info,
    };

    const response = await server.request(
      "/notification-send",
      {
        method: "POST",
        body: JSON.stringify(payload),
        headers: new Headers({ [bgb.ShieldApiKey.HEADER_NAME]: Env.API_KEY }),
      },
      ip,
    );

    expect(response.status).toBe(200);
    expect(mailerSend).toHaveBeenCalledWith({
      from: Env.EMAIL_FROM,
      to: Env.EMAIL_TO,
      subject: `ℹ️  [INFO] ${payload.subject}`,
      html: payload.content,
    });
  });

  test("happy path - error", async () => {
    const mailerSend = spyOn(Mailer, "send").mockImplementation(jest.fn());

    const payload = {
      subject: "subject",
      content: "content",
      kind: Notifier.VO.NotificationKindEnum.error,
    };

    const response = await server.request(
      "/notification-send",
      {
        method: "POST",
        body: JSON.stringify(payload),
        headers: new Headers({ [bgb.ShieldApiKey.HEADER_NAME]: Env.API_KEY }),
      },
      ip,
    );

    expect(response.status).toBe(200);

    expect(mailerSend).toHaveBeenCalledWith({
      from: Env.EMAIL_FROM,
      to: Env.EMAIL_TO,
      subject: `❌ [ERROR] ${payload.subject}`,
      html: payload.content,
    });
  });

  test("happy path - success", async () => {
    const mailerSend = spyOn(Mailer, "send").mockImplementation(jest.fn());

    const payload = {
      subject: "subject",
      content: "content",
      kind: Notifier.VO.NotificationKindEnum.success,
    };

    const response = await server.request(
      "/notification-send",
      {
        method: "POST",
        body: JSON.stringify(payload),
        headers: new Headers({ [bgb.ShieldApiKey.HEADER_NAME]: Env.API_KEY }),
      },
      ip,
    );

    expect(response.status).toBe(200);

    expect(mailerSend).toHaveBeenCalledWith({
      from: Env.EMAIL_FROM,
      to: Env.EMAIL_TO,
      subject: `✅ [SUCCESS] ${payload.subject}`,
      html: payload.content,
    });
  });

  test("happy path - default kind", async () => {
    const mailerSend = spyOn(Mailer, "send").mockImplementation(jest.fn());

    const payload = { subject: "subject", content: "content" };

    const response = await server.request(
      "/notification-send",
      {
        method: "POST",
        body: JSON.stringify(payload),
        headers: new Headers({ [bgb.ShieldApiKey.HEADER_NAME]: Env.API_KEY }),
      },
      ip,
    );

    expect(response.status).toBe(200);

    expect(mailerSend).toHaveBeenCalledWith({
      from: Env.EMAIL_FROM,
      to: Env.EMAIL_TO,
      subject: `ℹ️  [INFO] ${payload.subject}`,
      html: payload.content,
    });
  });
});
