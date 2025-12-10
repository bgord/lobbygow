import * as bg from "@bgord/bun";

export function createClock(): bg.ClockPort {
  return new bg.ClockSystemAdapter();
}
