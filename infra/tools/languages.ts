import * as bg from "@bgord/bun";

const SupportedLanguages = ["en"] as const;
export const Languages = new bg.Languages(SupportedLanguages, "en");
