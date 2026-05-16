"use client";

import { useLocale, useTranslations } from "next-intl";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStreamingReport } from "@/hooks/useStreamingReport";
import { AIMarkdown } from "@/components/ai/AIMarkdown";

export function WeeklyReportButton() {
  const locale = useLocale();
  const t = useTranslations("dashboard");
  const tAi = useTranslations("ai");
  const { report, loading, error, generate } = useStreamingReport();

  return (
    <div className="space-y-4">
      <Button
        type="button"
        variant="outline"
        onClick={() => generate(locale)}
        disabled={loading}
        className="gap-2"
      >
        <FileText className="h-4 w-4" />
        {loading ? t("generatingReport") : t("generateReport")}
      </Button>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {(report || loading) && (
        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{tAi("weeklyReport")}</CardTitle>
          </CardHeader>
          <CardContent>
            {report ? (
              <AIMarkdown content={report} />
            ) : (
              <p className="animate-pulse text-sm text-muted-foreground">
                {t("generatingReport")}
              </p>
            )}
            {loading && report && (
              <span className="mt-2 inline-block h-4 w-1 animate-pulse bg-primary" />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
