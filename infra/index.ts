import * as bgn from "@bgord/node";
import * as bgb from "@bgord/bun";
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
  bgb.TimeZoneOffsetVariables &
  bgb.ContextVariables &
  bgb.EtagVariables;

export const BODY_LIMIT_MAX_SIZE = new bgn.Size({
  value: 128,
  unit: bgn.SizeUnit.kB,
}).toBytes();

export const BasicAuthShield = basicAuth({
  username: Env.BASIC_AUTH_USERNAME,
  password: Env.BASIC_AUTH_PASSWORD,
});

export const ApiKeyShield = new bgb.ApiKeyShield({ API_KEY: Env.API_KEY });

export const prerequisites = [
  new bgn.PrerequisitePort({ label: "port", port: Env.PORT }),
  new bgn.PrerequisiteTimezoneUTC({ label: "timezone", timezone: Env.TZ }),
  new bgn.PrerequisiteRAM({
    label: "RAM",
    enabled: Env.type !== bgn.Schema.NodeEnvironmentEnum.local,
    minimum: new bgn.Size({ unit: bgn.SizeUnit.MB, value: 128 }),
  }),
  new bgn.PrerequisiteSpace({
    label: "disk-space",
    minimum: new bgn.Size({ unit: bgn.SizeUnit.MB, value: 512 }),
  }),
  new bgn.PrerequisiteNode({
    label: "node",
    version: bgn.PackageVersion.fromStringWithV("v22.6.0"),
  }),
  new bgn.PrerequisiteBun({
    label: "bun",
    version: bgn.PackageVersion.fromString("1.1.30"),
    current: Bun.version,
  }),
  new bgn.PrerequisiteMemory({
    label: "memory-consumption",
    maximum: new bgn.Size({ value: 300, unit: bgn.SizeUnit.MB }),
  }),
];

export const healthcheck = [
  new bgn.PrerequisiteSelf({ label: "self" }),
  new bgn.PrerequisiteOutsideConnectivity({ label: "outside-connectivity" }),
  new bgn.PrerequisiteMailer({ label: "nodemailer", mailer: Mailer }),
  ...prerequisites.filter(
    (prerequisite) => prerequisite.config.label !== "port",
  ),
];
