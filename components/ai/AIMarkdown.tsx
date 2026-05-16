"use client";

import ReactMarkdown from "react-markdown";

export function AIMarkdown({ content }: { content: string }) {
  return (
    <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-primary prose-strong:text-foreground">
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h3 className="mb-2 mt-4 text-lg font-semibold">{children}</h3>
          ),
          h2: ({ children }) => (
            <h4 className="mb-2 mt-3 text-base font-semibold">{children}</h4>
          ),
          h3: ({ children }) => (
            <h5 className="mb-1 mt-2 text-sm font-semibold">{children}</h5>
          ),
          ul: ({ children }) => (
            <ul className="my-2 list-disc space-y-1 pl-5">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="my-2 list-decimal space-y-1 pl-5">{children}</ol>
          ),
          p: ({ children }) => (
            <p className="my-2 leading-relaxed">{children}</p>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
