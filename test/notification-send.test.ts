import { describe, expect, test } from "bun:test";
import * as bgb from "@bgord/bun";
import * as infra from "../infra";
import * as Mailer from "../modules/mailer";
import { server } from "../server";
import * as testcases from "./testcases";

describe("POST /notification-send", () => {
  test("happy path", async () => {
    const res = await server.request(
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
      ip,
    );

    expect(res.status).toBe(200);
  });
});
