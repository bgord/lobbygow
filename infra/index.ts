import type * as bg from "@bgord/bun";
import { HTTPException } from "hono/http-exception";
import type { TimingVariables } from "hono/timing";

export const requestTimeoutError = new HTTPException(408, { message: "request_timeout_error" });

export type Variables = TimingVariables & bg.TimeZoneOffsetVariables & bg.ContextVariables & bg.EtagVariables;
