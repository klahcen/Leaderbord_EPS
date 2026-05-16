"use client";

import { Suspense, useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const authError = searchParams.get("error");
    if (authError && authError !== "CredentialsSignin") {
      setError(t("loginError"));
    }
  }, [searchParams, t]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError(t("loginError"));
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="login-page">
      <div className="login-left">
        <h1 className="login-left-headline">
          {t("loginHeadlineLine1")}
          <br />
          <em>{t("loginHeadlineEm1")}</em>.
          <br />
          {t("loginHeadlineLine2")}
          <br />
          <em>{t("loginHeadlineEm2")}</em>.
        </h1>
      </div>

      <div className="login-right">
        <div className="login-form-card">
          <div className="mb-6 flex justify-end">
            <LanguageSwitcher />
          </div>
          <h2
            className="mb-6 font-black tracking-tight"
            style={{ fontSize: "var(--text-xl)" }}
          >
            {t("welcomeBack")}
          </h2>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
          >
            <div>
              <Label
                htmlFor="email"
                className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >
                {t("email")}
              </Label>
              <Input
                id="email"
                type="email"
                className="input-lemonade"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="prof@pe.school"
                required
              />
            </div>
            <div>
              <Label
                htmlFor="password"
                className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >
                {t("password")}
              </Label>
              <Input
                id="password"
                type="password"
                className="input-lemonade"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <p className="text-sm font-medium text-destructive">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t("signingIn") : t("loginButton")}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link href="/leaderboard" className="font-semibold text-primary hover:underline">
              {t("viewPublicLeaderboard")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="login-page">
          <div className="login-right flex-1">
            <div className="login-form-card h-80 animate-pulse bg-muted" />
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
