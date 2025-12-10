import * as bg from "@bgord/bun";
import * as tools from "@bgord/tools";
import type { z } from "zod/v4";
import type { EnvironmentSchema } from "+infra/env";

export function createDiskSpaceChecker(
  Env: ReturnType<bg.EnvironmentValidator<z.infer<typeof EnvironmentSchema>>["load"]>,
): bg.DiskSpaceCheckerPort {
  const DiskSpaceCheckerNoopAdapter = new bg.DiskSpaceCheckerNoopAdapter(tools.Size.fromGB(10));
  const DiskSpaceCheckerBunAdapter = new bg.DiskSpaceCheckerBunAdapter();

  return {
    [bg.NodeEnvironmentEnum.local]: DiskSpaceCheckerBunAdapter,
    [bg.NodeEnvironmentEnum.test]: DiskSpaceCheckerNoopAdapter,
    [bg.NodeEnvironmentEnum.staging]: DiskSpaceCheckerNoopAdapter,
    [bg.NodeEnvironmentEnum.production]: DiskSpaceCheckerBunAdapter,
  }[Env.type];
}
