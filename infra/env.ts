import * as bg from "@bgord/bun";
import * as tools from "@bgord/tools";
import * as v from "valibot";

export const EnvironmentSchema = v.object({
  PORT: bg.Port,
  LOGS_LEVEL: v.enum(bg.LogLevelEnum),
  SMTP_HOST: bg.SmtpHost,
  SMTP_PORT: bg.SmtpPort,
  SMTP_USER: bg.SmtpUser,
  SMTP_PASS: bg.SmtpPass,
  EMAIL_FROM: tools.Email,
  EMAIL_TO: tools.Email,
  TZ: v.literal("UTC"),
  BASIC_AUTH_USERNAME: bg.BasicAuthUsername,
  BASIC_AUTH_PASSWORD: bg.BasicAuthPassword,
  API_KEY: tools.ApiKey,
});

type EnvironmentType = v.InferOutput<typeof EnvironmentSchema>;
export type EnvironmentResultType = bg.EnvironmentResultType<EnvironmentType>;

export const MasterKeyPath = tools.FilePathAbsolute.fromString("/etc/bgord/lobbygow/master.key");
export const SecretsPath = tools.FilePathAbsolute.fromString("/var/www/lobbygow/secrets.enc");

export async function createEnvironmentLoader(): Promise<bg.EnvironmentLoaderPort<EnvironmentType>> {
  const type = v.parse(v.enum(bg.NodeEnvironmentEnum), process.env.NODE_ENV);
  const config = { type, EnvironmentSchema };

  const FileInspection = new bg.FileInspectionAdapter();
  const FileReaderText = new bg.FileReaderTextAdapter();
  const FileReaderRaw = new bg.FileReaderRawAdapter();
  const FileWriter = new bg.FileWriterAdapter();

  const CryptoKeyProvider = new bg.CryptoKeyProviderFileAdapter(MasterKeyPath, {
    FileInspection,
    FileReaderText,
  });
  const Encryption = new bg.EncryptionAesGcmAdapter({
    CryptoKeyProvider,
    FileInspection,
    FileReaderRaw,
    FileWriter,
  });

  const CacheRepository = new bg.CacheRepositoryNodeCacheAdapter({ type: "infinite" });
  const CacheResolver = new bg.CacheResolverSimpleStrategy({ CacheRepository });
  const HashContent = new bg.HashContentSha256Strategy();

  const EnvironmentLoaderProcessSafe = new bg.EnvironmentLoaderProcessSafeAdapter<EnvironmentType>(
    process.env,
    config,
    { CacheResolver, HashContent },
  );

  return {
    [bg.NodeEnvironmentEnum.local]: EnvironmentLoaderProcessSafe,
    [bg.NodeEnvironmentEnum.test]: new bg.EnvironmentLoaderProcessAdapter<EnvironmentType>(
      process.env,
      config,
    ),
    [bg.NodeEnvironmentEnum.staging]: EnvironmentLoaderProcessSafe,
    [bg.NodeEnvironmentEnum.production]: new bg.EnvironmentLoaderEncryptedAdapter<EnvironmentType>(
      SecretsPath,
      config,
      { Encryption },
    ),
  }[type];
}
