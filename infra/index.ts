export * from "./env";
export * from "./mailer";
export * from "./logger";

import * as bg from "@bgord/node";
import { Env } from "./env";
import { Mailer } from "./mailer";

export const BasicAuthShield = new bg.BasicAuthShield({
  username: Env.BASIC_AUTH_USERNAME,
  password: Env.BASIC_AUTH_PASSWORD,
});

export const ApiKeyShield = new bg.ApiKeyShield({ API_KEY: Env.API_KEY });

export const prerequisites = [
  new bg.PrerequisitePort({ label: "port", port: Env.PORT }),
  new bg.PrerequisiteTimezoneUTC({ label: "timezone", timezone: Env.TZ }),
  new bg.PrerequisiteNode({
    label: "node version",
    version: bg.PackageVersion.fromStringWithV("v22.6.0"),
  }),
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
  new bg.PrerequisiteSSLCertificateExpiry({
    label: "ssl-certificate-expiry",
    host: "lobbygow.bgord.me",
    validDaysMinimum: 7,
  }),
  new bg.PrerequisiteMailer({ label: "nodemailer", mailer: Mailer }),
  ...prerequisites.filter(
    (prerequisite) => prerequisite.config.label !== "port",
  ),
];
