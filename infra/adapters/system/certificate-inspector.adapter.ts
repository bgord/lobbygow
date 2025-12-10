import * as bg from "@bgord/bun";

export function createCertificateInspector(
  type: bg.NodeEnvironmentEnum,
  deps: { Clock: bg.ClockPort },
): bg.CertificateInspectorPort {
  return {
    [bg.NodeEnvironmentEnum.local]: new bg.CertificateInspectorTLSAdapter(deps),
    [bg.NodeEnvironmentEnum.test]: new bg.CertificateInspectorNoopAdapter(30),
    [bg.NodeEnvironmentEnum.staging]: new bg.CertificateInspectorTLSAdapter(deps),
    [bg.NodeEnvironmentEnum.production]: new bg.CertificateInspectorTLSAdapter(deps),
  }[type];
}
