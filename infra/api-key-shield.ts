import * as bg from "@bgord/bun";
import { Env } from "./env";

export const ApiKeyShield = new bg.ApiKeyShield({ API_KEY: Env.API_KEY });
