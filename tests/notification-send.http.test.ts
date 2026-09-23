import { describe, expect, spyOn, test } from "bun:test";
import * as bg from "@bgord/bun";
import * as Notifier from "+notifier";
import { bootstrap } from "+infra/bootstrap";
import { createServer } from "../server";
import * as mocks from "./mocks";
import * as testcases from "./testcases";

const url = "/api/notification-send";

describe(`POST ${url}`, async () => {
  const di = await bootstrap();
  const server = createServer(di);
  const headers = { [bg.ShieldApiKeyStrategy.HEADER_NAME]: di.Env.API_KEY, ...mocks.correlationIdHeaders };

  test("shield - missing api key", async () => {
    using loggerError = spyOn(di.Adapters.System.Logger, "error");

    const response = await server.request(
      url,
      { method: "POST", body: JSON.stringify({}), headers: mocks.correlationIdHeaders },
      mocks.ip,
    );

    await testcases.assertAuthResponse(response);
    expect(loggerError).not.toHaveBeenCalledWith(expect.objectContaining({ message: "Classified error" }));
  });

  test("validation - empty payload", async () => {
    using loggerError = spyOn(di.Adapters.System.Logger, "error");

    const response = await server.request(
      url,
      { method: "POST", body: JSON.stringify({}), headers },
      mocks.ip,
    );

    await testcases.assertErrorResponse(response, 400, "mailer.subject.invalid");
    expect(loggerError).toHaveBeenCalledWith({
      message: "Classified error",
      component: "http",
      operation: "validation",
      correlationId: mocks.correlationId,
      metadata: { url: expect.stringContaining(url), status: 400 },
      error: expect.anything(),
    });
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

    await testcases.assertErrorResponse(response, 400, "mailer.subject.invalid");
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

    await testcases.assertErrorResponse(response, 400, "mailer.content.html.invalid");
  });

  test("happy path - info", async () => {
    using enqueue = spyOn(di.Tools.JobQueue, "enqueue");

    const response = await server.request(
      url,
      {
        method: "POST",
        body: JSON.stringify({ ...mocks.notification, kind: Notifier.VO.NotificationKindEnum.info }),
        headers,
      },
      mocks.ip,
    );

    expect(response.status).toEqual(200);
    expect(enqueue).toHaveBeenCalledWith(mocks.GenericSendEmailJobInfo);
  });

  test("happy path - error", async () => {
    using enqueue = spyOn(di.Tools.JobQueue, "enqueue");

    const response = await server.request(
      url,
      {
        method: "POST",
        body: JSON.stringify({ ...mocks.notification, kind: Notifier.VO.NotificationKindEnum.error }),
        headers,
      },
      mocks.ip,
    );

    expect(response.status).toEqual(200);
    expect(enqueue).toHaveBeenCalledWith(mocks.GenericSendEmailJobError);
  });

  test("happy path - success", async () => {
    using enqueue = spyOn(di.Tools.JobQueue, "enqueue");

    const response = await server.request(
      url,
      {
        method: "POST",
        body: JSON.stringify({ ...mocks.notification, kind: Notifier.VO.NotificationKindEnum.success }),
        headers,
      },
      mocks.ip,
    );

    expect(response.status).toEqual(200);
    expect(enqueue).toHaveBeenCalledWith(mocks.GenericSendEmailJobSuccess);
  });

  test("happy path - default", async () => {
    using enqueue = spyOn(di.Tools.JobQueue, "enqueue");

    const response = await server.request(
      url,
      { method: "POST", body: JSON.stringify(mocks.notification), headers },
      mocks.ip,
    );

    expect(response.status).toEqual(200);
    expect(enqueue).toHaveBeenCalledWith(mocks.GenericSendEmailJobInfo);
  });
});
