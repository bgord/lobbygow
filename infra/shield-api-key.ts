import * as bg from "@bgord/bun";
import { Env } from "./env";

export const ShieldApiKey = new bg.ShieldApiKey({ API_KEY: Env.API_KEY });
