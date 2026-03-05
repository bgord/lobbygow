import type * as bg from "@bgord/bun";

/** @public */
export enum SupportedLanguages {
  en = "en",
  pl = "pl",
}

export const I18n: bg.I18nConfig = {
  supportedLanguages: SupportedLanguages,
  defaultLanguage: SupportedLanguages.en,
};
