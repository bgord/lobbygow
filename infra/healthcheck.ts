import * as bg from "@bgord/bun";
import { prerequisites } from "./prerequisites";

export const healthcheck = [
  new bg.PrerequisiteSelf({ label: "self" }),
  ...prerequisites.filter((prerequisite) => prerequisite.label !== "port"),
];
