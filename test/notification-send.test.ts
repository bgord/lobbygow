import * as bgb from "@bgord/bun";
import { describe, test, expect } from "bun:test";

import * as infra from "../infra";
import * as Mailer from "../modules/mailer";

import { server } from "../server";

const ip = {
  server: {
    requestIP: () => ({ address: "127.0.0.1", family: "foo", port: "123" }),
  },
};

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
      ip
    );

    expect(res.status).toBe(200);
  });
});
