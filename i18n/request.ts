import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

const validLocales = ["en", "fr", "ar"] as const;

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value ?? "en";
  const safeLocale = validLocales.includes(locale as (typeof validLocales)[number])
    ? locale
    : "en";

  return {
    locale: safeLocale,
    messages: (await import(`../messages/${safeLocale}.json`)).default,
  };
});
