interface PerformanceSummaryProps {
  summary: {
    views_last_7d: number;
    views_prior_7d: number;
    favorites_last_7d: number;
    favorites_prior_7d: number;
    leads_last_7d: number;
    leads_prior_7d: number;
  };
}

function calculatePercentChange(current: number, previous: number): { change: number; isPositive: boolean; label: string } {
  if (previous === 0) {
    return { change: 0, isPositive: current > 0, label: current > 0 ? "New!" : "No change" };
  }
  const change = ((current - previous) / previous) * 100;
  return {
    change: Math.abs(change),
    isPositive: change >= 0,
    label: `${change >= 0 ? "+" : "-"}${Math.abs(change).toFixed(0)}%`,
  };
}

export function PerformanceSummary({ summary }: PerformanceSummaryProps) {
  const viewsChange = calculatePercentChange(summary.views_last_7d, summary.views_prior_7d);
  const favoritesChange = calculatePercentChange(summary.favorites_last_7d, summary.favorites_prior_7d);
  const leadsChange = calculatePercentChange(summary.leads_last_7d, summary.leads_prior_7d);

  return (
    <div className="mb-8 rounded-lg border border-slate-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-bold text-slate-900">Performance (Last 7 Days vs Prior 7 Days)</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {/* Views Comparison */}
        <div className="rounded-lg bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-600">Views</p>
          <div className="mt-3 flex items-end gap-4">
            <div>
              <p className="text-xs text-slate-500">Last 7 days</p>
              <p className="text-2xl font-black text-slate-900">{summary.views_last_7d}</p>
            </div>
            <div className={`rounded-full px-3 py-1 text-sm font-bold ${
              viewsChange.isPositive
                ? "bg-green-100 text-green-900"
                : "bg-red-100 text-red-900"
            }`}>
              {viewsChange.label}
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Prior: {summary.views_prior_7d}
          </p>
        </div>

        {/* Favorites Comparison */}
        <div className="rounded-lg bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-600">Saves</p>
          <div className="mt-3 flex items-end gap-4">
            <div>
              <p className="text-xs text-slate-500">Last 7 days</p>
              <p className="text-2xl font-black text-slate-900">{summary.favorites_last_7d}</p>
            </div>
            <div className={`rounded-full px-3 py-1 text-sm font-bold ${
              favoritesChange.isPositive
                ? "bg-green-100 text-green-900"
                : "bg-red-100 text-red-900"
            }`}>
              {favoritesChange.label}
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Prior: {summary.favorites_prior_7d}
          </p>
        </div>

        {/* Leads Comparison */}
        <div className="rounded-lg bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-600">Leads (Clicks)</p>
          <div className="mt-3 flex items-end gap-4">
            <div>
              <p className="text-xs text-slate-500">Last 7 days</p>
              <p className="text-2xl font-black text-slate-900">{summary.leads_last_7d}</p>
            </div>
            <div className={`rounded-full px-3 py-1 text-sm font-bold ${
              leadsChange.isPositive
                ? "bg-green-100 text-green-900"
                : "bg-red-100 text-red-900"
            }`}>
              {leadsChange.label}
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Prior: {summary.leads_prior_7d}
          </p>
        </div>
      </div>
    </div>
  );
}
