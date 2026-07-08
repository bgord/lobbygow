import * as bg from "@bgord/bun";
import * as v from "valibot";

export const name = "lobbygow";

export const hostname = v.parse(bg.Hostname, `${name}.bgord.space`);
export const host = `https://${hostname}`;
export const localhost = "http://localhost:3000";
