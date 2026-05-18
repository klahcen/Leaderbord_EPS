export default function LeaderboardLoading() {
  return (
    <main className="min-h-screen animate-pulse bg-background">
      <div className="h-16 border-b bg-muted/40" />
      <div className="mx-auto max-w-5xl space-y-6 px-6 py-8">
        <div className="h-32 rounded-xl bg-muted" />
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-9 w-20 rounded-full bg-muted" />
          ))}
        </div>
        <div className="h-48 rounded-xl bg-muted" />
        <div className="h-64 rounded-xl bg-muted" />
      </div>
    </main>
  );
}
