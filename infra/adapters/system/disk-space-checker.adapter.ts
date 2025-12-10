import * as bg from "@bgord/bun";
import * as tools from "@bgord/tools";

export function createDiskSpaceChecker(type: bg.NodeEnvironmentEnum): bg.DiskSpaceCheckerPort {
  const DiskSpaceCheckerNoopAdapter = new bg.DiskSpaceCheckerNoopAdapter(tools.Size.fromGB(10));
  const DiskSpaceCheckerBunAdapter = new bg.DiskSpaceCheckerBunAdapter();

  return {
    [bg.NodeEnvironmentEnum.local]: DiskSpaceCheckerBunAdapter,
    [bg.NodeEnvironmentEnum.test]: DiskSpaceCheckerNoopAdapter,
    [bg.NodeEnvironmentEnum.staging]: DiskSpaceCheckerNoopAdapter,
    [bg.NodeEnvironmentEnum.production]: DiskSpaceCheckerBunAdapter,
  }[type];
}
