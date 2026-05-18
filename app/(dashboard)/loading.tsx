export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-6 p-1">
      <div className="h-10 w-64 rounded-lg bg-muted" />
      <div className="kpi-grid">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-muted" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-64 rounded-xl bg-muted" />
        <div className="h-64 rounded-xl bg-muted" />
      </div>
      <div className="h-48 rounded-xl bg-muted" />
    </div>
  );
}
