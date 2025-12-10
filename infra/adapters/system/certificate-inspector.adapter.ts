import * as bg from "@bgord/bun";
import type { z } from "zod/v4";
import type { EnvironmentSchema } from "+infra/env";

export function createCertificateInspector(
  Env: ReturnType<bg.EnvironmentValidator<z.infer<typeof EnvironmentSchema>>["load"]>,
  deps: { Clock: bg.ClockPort },
): bg.CertificateInspectorPort {
  return {
    [bg.NodeEnvironmentEnum.local]: new bg.CertificateInspectorTLSAdapter(deps),
    [bg.NodeEnvironmentEnum.test]: new bg.CertificateInspectorNoopAdapter(30),
    [bg.NodeEnvironmentEnum.staging]: new bg.CertificateInspectorTLSAdapter(deps),
    [bg.NodeEnvironmentEnum.production]: new bg.CertificateInspectorTLSAdapter(deps),
  }[Env.type];
}
