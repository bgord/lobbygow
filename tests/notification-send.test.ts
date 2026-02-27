import { describe, expect, jest, spyOn, test } from "bun:test";
import * as bg from "@bgord/bun";
import * as Notifier from "+notifier";
import { bootstrap } from "+infra/bootstrap";
import { createServer } from "../server";
import * as mocks from "./mocks";

const url = "/api/notification-send";

describe(`POST ${url}`, async () => {
  const di = await bootstrap();
  const server = createServer(di);
  const headers = new Headers({ [bg.ShieldApiKeyStrategy.HEADER_NAME]: di.Env.API_KEY });
  const config = { from: di.Env.EMAIL_FROM, to: di.Env.EMAIL_TO };

  test("validation - empty payload", async () => {
    const response = await server.request(
      url,
      { method: "POST", body: JSON.stringify({}), headers },
      mocks.ip,
    );
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({ message: "mailer.subject.invalid", _known: true });
  });

  test("validation - missing subject", async () => {
    const response = await server.request(
      url,
      {
        method: "POST",
        body: JSON.stringify({ content: "content", kind: Notifier.VO.NotificationKindEnum.info }),
        headers,
      },
      mocks.ip,
    );
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({ message: "mailer.subject.invalid", _known: true });
  });

  test("validation - missing content", async () => {
    const response = await server.request(
      url,
      {
        method: "POST",
        body: JSON.stringify({ subject: "subject", kind: Notifier.VO.NotificationKindEnum.info }),
        headers,
      },
      mocks.ip,
    );
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({ message: "mailer.content.html.invalid", _known: true });
  });

  test("happy path - info", async () => {
    using mailerSend = spyOn(di.Adapters.System.Mailer, "send").mockImplementation(jest.fn());
    const payload = {
      subject: "subject",
      content: "content",
      kind: Notifier.VO.NotificationKindEnum.info,
    };

    const response = await server.request(
      url,
      {
        method: "POST",
        body: JSON.stringify(payload),
        headers,
      },
      mocks.ip,
    );

    expect(response.status).toBe(200);
    expect(mailerSend).toHaveBeenCalledWith({
      config,
      message: { subject: `ℹ️  [INFO] ${payload.subject}`, html: payload.content },
    });
  });

  test("happy path - error", async () => {
    using mailerSend = spyOn(di.Adapters.System.Mailer, "send").mockImplementation(jest.fn());
    const payload = {
      subject: "subject",
      content: "content",
      kind: Notifier.VO.NotificationKindEnum.error,
    };

    const response = await server.request(
      url,
      { method: "POST", body: JSON.stringify(payload), headers },
      mocks.ip,
    );

    expect(response.status).toBe(200);
    expect(mailerSend).toHaveBeenCalledWith({
      config,
      message: { subject: `❌ [ERROR] ${payload.subject}`, html: payload.content },
    });
  });

  test("happy path - success", async () => {
    using mailerSend = spyOn(di.Adapters.System.Mailer, "send").mockImplementation(jest.fn());
    const payload = {
      subject: "subject",
      content: "content",
      kind: Notifier.VO.NotificationKindEnum.success,
    };

    const response = await server.request(
      url,
      { method: "POST", body: JSON.stringify(payload), headers },
      mocks.ip,
    );

    expect(response.status).toBe(200);
    expect(mailerSend).toHaveBeenCalledWith({
      config,
      message: { subject: `✅ [SUCCESS] ${payload.subject}`, html: payload.content },
    });
  });

  test("happy path - default kind", async () => {
    using mailerSend = spyOn(di.Adapters.System.Mailer, "send").mockImplementation(jest.fn());
    const payload = { subject: "subject", content: "content" };

    const response = await server.request(
      url,
      { method: "POST", body: JSON.stringify(payload), headers },
      mocks.ip,
    );

    expect(response.status).toBe(200);
    expect(mailerSend).toHaveBeenCalledWith({
      config,
      message: { subject: `ℹ️  [INFO] ${payload.subject}`, html: payload.content },
    });
  });
});
