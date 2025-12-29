import * as bg from "@bgord/bun";
import * as tools from "@bgord/tools";

export function createShieldTimeout(): bg.ShieldStrategy {
  return new bg.ShieldTimeoutStrategy({ duration: tools.Duration.Seconds(15) });
}
