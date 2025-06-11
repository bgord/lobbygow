import { describe, expect, jest, spyOn, test } from "bun:test";
import * as bgb from "@bgord/bun";
import * as infra from "../infra";
import * as Mailer from "../modules/mailer";
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
        headers: new Headers({
          [bgb.ApiKeyShield.HEADER_NAME]: infra.Env.API_KEY,
        }),
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
        headers: new Headers({
          [bgb.ApiKeyShield.HEADER_NAME]: infra.Env.API_KEY,
        }),
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
        body: JSON.stringify({
          content: "content",
          kind: Mailer.VO.NotificationKindEnum.info,
        }),
        headers: new Headers({
          [bgb.ApiKeyShield.HEADER_NAME]: infra.Env.API_KEY,
        }),
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
        body: JSON.stringify({
          subject: "subject",
          kind: Mailer.VO.NotificationKindEnum.info,
        }),
        headers: new Headers({
          [bgb.ApiKeyShield.HEADER_NAME]: infra.Env.API_KEY,
        }),
      },
      ip,
    );

    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({ message: "payload.invalid.error", _known: true });
  });

  test("happy path - info", async () => {
    const infraMailerSend = spyOn(infra.Mailer, "send").mockImplementation(jest.fn());

    const payload = {
      subject: "subject",
      content: "content",
      kind: Mailer.VO.NotificationKindEnum.info,
    };

    const response = await server.request(
      "/notification-send",
      {
        method: "POST",
        body: JSON.stringify(payload),
        headers: new Headers({
          [bgb.ApiKeyShield.HEADER_NAME]: infra.Env.API_KEY,
        }),
      },
      ip,
    );

    expect(response.status).toBe(200);

    expect(infraMailerSend).toHaveBeenCalledWith({
      from: infra.Env.EMAIL_FROM,
      to: infra.Env.EMAIL_TO,
      subject: `ℹ️  [INFO] ${payload.subject}`,
      content: payload.content,
    });
  });

  test("happy path - error", async () => {
    const infraMailerSend = spyOn(infra.Mailer, "send").mockImplementation(jest.fn());

    const payload = {
      subject: "subject",
      content: "content",
      kind: Mailer.VO.NotificationKindEnum.error,
    };

    const response = await server.request(
      "/notification-send",
      {
        method: "POST",
        body: JSON.stringify(payload),
        headers: new Headers({
          [bgb.ApiKeyShield.HEADER_NAME]: infra.Env.API_KEY,
        }),
      },
      ip,
    );

    expect(response.status).toBe(200);

    expect(infraMailerSend).toHaveBeenCalledWith({
      from: infra.Env.EMAIL_FROM,
      to: infra.Env.EMAIL_TO,
      subject: `❌ [ERROR] ${payload.subject}`,
      content: payload.content,
    });
  });

  test("happy path - success", async () => {
    const infraMailerSend = spyOn(infra.Mailer, "send").mockImplementation(jest.fn());

    const payload = {
      subject: "subject",
      content: "content",
      kind: Mailer.VO.NotificationKindEnum.success,
    };

    const response = await server.request(
      "/notification-send",
      {
        method: "POST",
        body: JSON.stringify(payload),
        headers: new Headers({
          [bgb.ApiKeyShield.HEADER_NAME]: infra.Env.API_KEY,
        }),
      },
      ip,
    );

    expect(response.status).toBe(200);

    expect(infraMailerSend).toHaveBeenCalledWith({
      from: infra.Env.EMAIL_FROM,
      to: infra.Env.EMAIL_TO,
      subject: `✅ [SUCCESS] ${payload.subject}`,
      content: payload.content,
    });
  });

  test("happy path - default kind", async () => {
    const infraMailerSend = spyOn(infra.Mailer, "send").mockImplementation(jest.fn());

    const payload = { subject: "subject", content: "content" };

    const response = await server.request(
      "/notification-send",
      {
        method: "POST",
        body: JSON.stringify(payload),
        headers: new Headers({
          [bgb.ApiKeyShield.HEADER_NAME]: infra.Env.API_KEY,
        }),
      },
      ip,
    );

    expect(response.status).toBe(200);

    expect(infraMailerSend).toHaveBeenCalledWith({
      from: infra.Env.EMAIL_FROM,
      to: infra.Env.EMAIL_TO,
      subject: `ℹ️  [INFO] ${payload.subject}`,
      content: payload.content,
    });
  });
});
