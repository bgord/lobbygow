import * as bg from "@bgord/node";
import { basicAuth } from "hono/basic-auth";
import { HTTPException } from "hono/http-exception";

import { Env } from "./env";
import { Mailer } from "./mailer";
import type { TimingVariables } from "hono/timing";

export * from "./env";
export * from "./mailer";
export * from "./logger";

export const requestTimeoutError = new HTTPException(408, {
  message: "request_timeout_error",
});

export type Variables = TimingVariables &
  bg.Bun.TimeZoneOffsetVariables &
  bg.Bun.ContextVariables &
  bg.Bun.EtagVariables;

export const BODY_LIMIT_MAX_SIZE = new bg.Size({
  value: 128,
  unit: bg.SizeUnit.kB,
}).toBytes();

export const BasicAuthShield = basicAuth({
  username: Env.BASIC_AUTH_USERNAME,
  password: Env.BASIC_AUTH_PASSWORD,
});

export const ApiKeyShield = new bg.Bun.ApiKeyShield({ API_KEY: Env.API_KEY });

export const prerequisites = [
  new bg.PrerequisitePort({ label: "port", port: Env.PORT }),
  new bg.PrerequisiteTimezoneUTC({ label: "timezone", timezone: Env.TZ }),
  new bg.PrerequisiteRAM({
    label: "RAM",
    enabled: Env.type !== bg.Schema.NodeEnvironmentEnum.local,
    minimum: new bg.Size({ unit: bg.SizeUnit.MB, value: 128 }),
  }),
  new bg.PrerequisiteSpace({
    label: "disk space",
    minimum: new bg.Size({ unit: bg.SizeUnit.MB, value: 512 }),
  }),
  new bg.PrerequisiteMemory({
    label: "memory-consumption",
    maximum: new bg.Size({ value: 300, unit: bg.SizeUnit.MB }),
  }),
];

export const healthcheck = [
  new bg.PrerequisiteSelf({ label: "self" }),
  new bg.PrerequisiteOutsideConnectivity({ label: "outside-connectivity" }),
  new bg.PrerequisiteMailer({ label: "nodemailer", mailer: Mailer }),
  ...prerequisites.filter(
    (prerequisite) => prerequisite.config.label !== "port",
  ),
];
