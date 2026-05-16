"use client";

import { useState, useCallback } from "react";

export function useStreamingReport() {
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (locale?: string) => {
    setReport("");
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/class-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: locale ?? "en" }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to generate report");
      }

      if (!res.body) {
        throw new Error("No response body");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setReport((prev) => prev + decoder.decode(value, { stream: true }));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate report");
    } finally {
      setLoading(false);
    }
  }, []);

  return { report, loading, error, generate };
}
