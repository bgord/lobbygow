import * as bg from "@bgord/bun";
import * as tools from "@bgord/tools";

export function createShieldTimeout(): bg.MiddlewareHonoPort {
  return new bg.ShieldTimeoutHonoStrategy({ duration: tools.Duration.Seconds(15) });
}
