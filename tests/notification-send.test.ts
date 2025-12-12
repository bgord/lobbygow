import { describe, expect, jest, spyOn, test } from "bun:test";
import * as bg from "@bgord/bun";
import * as bgb from "@bgord/bun";
import type { z } from "zod/v4";
import * as Notifier from "+notifier";
import { bootstrap } from "+infra/bootstrap";
import { EnvironmentSchema } from "+infra/env";
import { createServer } from "../server";

const ip = {
  server: {
    requestIP: () => ({ address: "127.0.0.1", family: "foo", port: "123" }),
  },
};

const url = "/api/notification-send";

const Env = new bg.EnvironmentValidator<z.infer<typeof EnvironmentSchema>>({
  type: process.env.NODE_ENV,
  schema: EnvironmentSchema,
}).load();

describe(`POST ${url}`, () => {
  test("validation - empty payload", async () => {
    const di = await bootstrap(Env);
    const server = createServer(di);

    const response = await server.request(
      url,
      {
        method: "POST",
        headers: new Headers({ [bgb.ShieldApiKeyAdapter.HEADER_NAME]: di.Env.API_KEY }),
      },
      ip,
    );

    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({ message: "payload.invalid.error", _known: true });
  });

  test("validation - invalid payload", async () => {
    const di = await bootstrap(Env);
    const server = createServer(di);

    const response = await server.request(
      url,
      {
        method: "POST",
        body: "invalid-json",
        headers: new Headers({ [bgb.ShieldApiKeyAdapter.HEADER_NAME]: di.Env.API_KEY }),
      },
      ip,
    );

    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({ message: "payload.invalid.error", _known: true });
  });

  test("validation - missing subject", async () => {
    const di = await bootstrap(Env);
    const server = createServer(di);

    const response = await server.request(
      url,
      {
        method: "POST",
        body: JSON.stringify({ content: "content", kind: Notifier.VO.NotificationKindEnum.info }),
        headers: new Headers({ [bgb.ShieldApiKeyAdapter.HEADER_NAME]: di.Env.API_KEY }),
      },
      ip,
    );

    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({ message: "payload.invalid.error", _known: true });
  });

  test("validation - missing content", async () => {
    const di = await bootstrap(Env);
    const server = createServer(di);

    const response = await server.request(
      url,
      {
        method: "POST",
        body: JSON.stringify({ subject: "subject", kind: Notifier.VO.NotificationKindEnum.info }),
        headers: new Headers({ [bgb.ShieldApiKeyAdapter.HEADER_NAME]: di.Env.API_KEY }),
      },
      ip,
    );

    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({ message: "payload.invalid.error", _known: true });
  });

  test("happy path - info", async () => {
    const di = await bootstrap(Env);
    const server = createServer(di);

    const mailerSend = spyOn(di.Adapters.System.Mailer, "send").mockImplementation(jest.fn());

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
        headers: new Headers({ [bgb.ShieldApiKeyAdapter.HEADER_NAME]: di.Env.API_KEY }),
      },
      ip,
    );

    expect(response.status).toBe(200);
    expect(mailerSend).toHaveBeenCalledWith({
      from: di.Env.EMAIL_FROM,
      to: di.Env.EMAIL_TO,
      subject: `ℹ️  [INFO] ${payload.subject}`,
      html: payload.content,
    });
  });

  test("happy path - error", async () => {
    const di = await bootstrap(Env);
    const server = createServer(di);

    const mailerSend = spyOn(di.Adapters.System.Mailer, "send").mockImplementation(jest.fn());

    const payload = {
      subject: "subject",
      content: "content",
      kind: Notifier.VO.NotificationKindEnum.error,
    };

    const response = await server.request(
      url,
      {
        method: "POST",
        body: JSON.stringify(payload),
        headers: new Headers({ [bgb.ShieldApiKeyAdapter.HEADER_NAME]: di.Env.API_KEY }),
      },
      ip,
    );

    expect(response.status).toBe(200);

    expect(mailerSend).toHaveBeenCalledWith({
      from: di.Env.EMAIL_FROM,
      to: di.Env.EMAIL_TO,
      subject: `❌ [ERROR] ${payload.subject}`,
      html: payload.content,
    });
  });

  test("happy path - success", async () => {
    const di = await bootstrap(Env);
    const server = createServer(di);

    const mailerSend = spyOn(di.Adapters.System.Mailer, "send").mockImplementation(jest.fn());

    const payload = {
      subject: "subject",
      content: "content",
      kind: Notifier.VO.NotificationKindEnum.success,
    };

    const response = await server.request(
      url,
      {
        method: "POST",
        body: JSON.stringify(payload),
        headers: new Headers({ [bgb.ShieldApiKeyAdapter.HEADER_NAME]: di.Env.API_KEY }),
      },
      ip,
    );

    expect(response.status).toBe(200);

    expect(mailerSend).toHaveBeenCalledWith({
      from: di.Env.EMAIL_FROM,
      to: di.Env.EMAIL_TO,
      subject: `✅ [SUCCESS] ${payload.subject}`,
      html: payload.content,
    });
  });

  test("happy path - default kind", async () => {
    const di = await bootstrap(Env);
    const server = createServer(di);

    const mailerSend = spyOn(di.Adapters.System.Mailer, "send").mockImplementation(jest.fn());

    const payload = { subject: "subject", content: "content" };

    const response = await server.request(
      url,
      {
        method: "POST",
        body: JSON.stringify(payload),
        headers: new Headers({ [bgb.ShieldApiKeyAdapter.HEADER_NAME]: di.Env.API_KEY }),
      },
      ip,
    );

    expect(response.status).toBe(200);

    expect(mailerSend).toHaveBeenCalledWith({
      from: di.Env.EMAIL_FROM,
      to: di.Env.EMAIL_TO,
      subject: `ℹ️  [INFO] ${payload.subject}`,
      html: payload.content,
    });
  });
});
