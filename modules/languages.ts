import * as bg from "@bgord/bun";

const SupportedLanguages = ["en"] as const;

export const languages = new bg.Languages(SupportedLanguages, "en");
