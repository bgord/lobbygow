import type * as bg from "@bgord/bun";
import type { TimingVariables } from "hono/timing";

export type Config = {
  Variables: TimingVariables & bg.TimeZoneOffsetVariables & bg.ContextVariables & bg.EtagVariables;
};
