import * as bg from "@bgord/bun";
import { Mailer } from "./mailer.adapter";
import { prerequisites } from "./prerequisites";

export const healthcheck = [
  new bg.PrerequisiteSelf({ label: "self" }),
  new bg.PrerequisiteOutsideConnectivity({ label: "outside-connectivity" }),
  new bg.PrerequisiteMailer({ label: "nodemailer", mailer: Mailer }),
  ...prerequisites.filter((prerequisite) => prerequisite.label !== "port"),
];
