"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AIMarkdown } from "@/components/ai/AIMarkdown";

export function AIAnalysisButton({ studentId }: { studentId: string }) {
  const locale = useLocale();
  const t = useTranslations("common");
  const tAi = useTranslations("ai");
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze() {
    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const res = await fetch("/api/ai/analyze-student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, locale }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setAnalysis(data.analysis);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to analyze");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <Button
        type="button"
        variant="outline"
        onClick={handleAnalyze}
        disabled={loading}
        className="gap-2"
      >
        <Sparkles className="h-4 w-4" />
        {loading ? t("analyzing") : t("analyze")}
      </Button>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {analysis && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-primary" />
              {tAi("coachReport")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AIMarkdown content={analysis} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
