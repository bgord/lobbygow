import { describe, expect, spyOn, test } from "bun:test";
import * as Notifier from "+notifier";
import { bootstrap } from "+infra/bootstrap";
import * as mocks from "./mocks";

describe("SendEmailJobHandler", async () => {
  const di = await bootstrap();

  test("happy path", async () => {
    using send = spyOn(di.Adapters.System.Mailer, "send");

    await Notifier.JobHandlers.SendEmailJobHandler(di.Adapters.System)(mocks.GenericSendEmailJobInfo);

    expect(send).toHaveBeenCalledWith({
      attachments: undefined,
      config: { from: di.Env.EMAIL_FROM, to: di.Env.EMAIL_TO },
      message: { subject: `ℹ️  [INFO] ${mocks.subject}`, html: mocks.content },
    });
  });
});
