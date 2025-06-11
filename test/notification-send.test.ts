import { describe, expect, test } from "bun:test";
import * as bgb from "@bgord/bun";
import * as infra from "../infra";
import * as Mailer from "../modules/mailer";
import { server } from "../server";
import * as testcases from "./testcases";

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
      testcases.ip,
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
      testcases.ip,
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
      testcases.ip,
    );

    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({ message: "payload.invalid.error", _known: true });
  });

  test("happy path", async () => {
    const response = await server.request(
      "/notification-send",
      {
        method: "POST",
        body: JSON.stringify({
          subject: "subject",
          content: "content",
          kind: Mailer.VO.NotificationKindEnum.info,
        }),
        headers: new Headers({
          [bgb.ApiKeyShield.HEADER_NAME]: infra.Env.API_KEY,
        }),
      },
      testcases.ip,
    );

    expect(response.status).toBe(200);
  });

  test("happy path - default kind", async () => {
    const response = await server.request(
      "/notification-send",
      {
        method: "POST",
        body: JSON.stringify({
          subject: "subject",
          content: "content",
        }),
        headers: new Headers({
          [bgb.ApiKeyShield.HEADER_NAME]: infra.Env.API_KEY,
        }),
      },
      testcases.ip,
    );

    expect(response.status).toBe(200);
  });
});
