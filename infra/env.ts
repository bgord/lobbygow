import * as bg from "@bgord/bun";
import * as tools from "@bgord/tools";
import { z } from "zod/v4";

export const Schema = z
  .object({
    PORT: bg.Port,
    LOGS_LEVEL: bg.LogLevel,
    SMTP_HOST: bg.SmtpHost,
    SMTP_PORT: bg.SmtpPort,
    SMTP_USER: bg.SmtpUser,
    SMTP_PASS: bg.SmtpPass,
    EMAIL_FROM: tools.Email,
    EMAIL_TO: tools.Email,
    TZ: bg.TimezoneUtc,
    BASIC_AUTH_USERNAME: bg.BasicAuthUsername,
    BASIC_AUTH_PASSWORD: bg.BasicAuthPassword,
    API_KEY: tools.ApiKey,
  })
  .strip();

export type EnvironmentType = bg.EnvironmentResultType<typeof Schema>;

export const MasterKeyPath = tools.FilePathAbsolute.fromString("/etc/bgord/lobbygow/master.key");
export const SecretsPath = tools.FilePathAbsolute.fromString("/var/www/lobbygow/secrets.enc");

export async function createEnvironmentLoader(): Promise<bg.EnvironmentLoaderPort<typeof Schema>> {
  const type = bg.NodeEnvironment.parse(process.env.NODE_ENV);

  const CryptoKeyProvider = new bg.CryptoKeyProviderFileAdapter(MasterKeyPath);
  const Encryption = new bg.EncryptionAesGcmAdapter({ CryptoKeyProvider });

  const CacheRepository = new bg.CacheRepositoryNodeCacheAdapter({ type: "infinite" });
  const CacheResolver = new bg.CacheResolverSimpleStrategy({ CacheRepository });

  const HashContent = new bg.HashContentSha256BunStrategy();

  const EnvironmentLoaderProcessSafe = new bg.EnvironmentLoaderProcessSafeAdapter(
    process.env,
    { type, Schema },
    { CacheResolver, HashContent },
  );

  return {
    [bg.NodeEnvironmentEnum.local]: EnvironmentLoaderProcessSafe,
    [bg.NodeEnvironmentEnum.test]: new bg.EnvironmentLoaderProcessAdapter({ type, Schema }, process.env),
    [bg.NodeEnvironmentEnum.staging]: EnvironmentLoaderProcessSafe,
    [bg.NodeEnvironmentEnum.production]: new bg.EnvironmentLoaderEncryptedAdapter(
      { type, Schema, path: SecretsPath },
      { Encryption },
    ),
  }[type];
}
