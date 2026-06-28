import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { DeveloperFooter } from "@/components/DeveloperFooter";

export const metadata: Metadata = {
  title: "PE Dashboard — Physical Education Leaderboard",
  description: "Manage student progress and display class leaderboard",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body
        className={`min-h-screen overflow-x-hidden font-sans antialiased ${locale === "ar" ? "font-arabic" : ""}`}
      >
        <NextIntlClientProvider messages={messages}>
          <SessionProvider>
            <ThemeProvider>
              <div className="flex min-h-screen flex-col">
                <div className="flex-1">{children}</div>
                <DeveloperFooter />
              </div>
            </ThemeProvider>
          </SessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
