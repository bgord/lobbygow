import { basicAuth } from "hono/basic-auth";
import { Env } from "./env";

export const ShieldBasicAuth = basicAuth({
  username: Env.BASIC_AUTH_USERNAME,
  password: Env.BASIC_AUTH_PASSWORD,
});
