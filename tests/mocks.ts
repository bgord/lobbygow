import * as bg from "@bgord/bun";
import { EnvironmentSchema } from "+infra/env";

export const ip = { server: { requestIP: () => ({ address: "127.0.0.1", family: "foo", port: "123" }) } };

export const Env = new bg.EnvironmentValidator({
  type: bg.NodeEnvironmentEnum.test,
  schema: EnvironmentSchema,
}).load(process.env);
