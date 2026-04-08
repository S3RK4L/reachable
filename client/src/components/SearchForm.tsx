interface SearchFilters {
  location: string;
  startDate: string;
  endDate: string;
  maxTravelTime: number;
}

interface SearchFormProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
}

export default function SearchForm({ filters, onChange }: SearchFormProps) {
  const update = (partial: Partial<SearchFilters>) => {
    onChange({ ...filters, ...partial });
  };

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="bg-surface rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6 space-y-5"
    >
      {/* Row 1: location + dates */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="location" className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-1.5">
            Starting point
          </label>
          <input
            id="location"
            type="text"
            placeholder="City or postcode"
            value={filters.location}
            onChange={(e) => update({ location: e.target.value })}
            className="w-full rounded-xl bg-page text-ink px-4 py-3 text-sm border border-transparent placeholder:text-ink-faint focus:outline-none focus:border-ocean focus:ring-1 focus:ring-ocean transition"
          />
        </div>

        <div>
          <label htmlFor="start-date" className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-1.5">
            From
          </label>
          <input
            id="start-date"
            type="date"
            value={filters.startDate}
            onChange={(e) => update({ startDate: e.target.value })}
            className="w-full rounded-xl bg-page text-ink px-4 py-3 text-sm border border-transparent focus:outline-none focus:border-ocean focus:ring-1 focus:ring-ocean transition"
          />
        </div>

        <div>
          <label htmlFor="end-date" className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-1.5">
            To
          </label>
          <input
            id="end-date"
            type="date"
            value={filters.endDate}
            onChange={(e) => update({ endDate: e.target.value })}
            className="w-full rounded-xl bg-page text-ink px-4 py-3 text-sm border border-transparent focus:outline-none focus:border-ocean focus:ring-1 focus:ring-ocean transition"
          />
        </div>
      </div>

      {/* Row 2: max journey slider — full width */}
      <div>
        <label htmlFor="travel-time" className="flex items-center gap-3 text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">
          Max journey
          <span className="text-xl font-extrabold text-ocean normal-case tracking-tight tabular-nums">
            {filters.maxTravelTime}<span className="text-xs font-bold ml-0.5 text-ink-muted">min</span>
          </span>
        </label>
        <div className="bg-page rounded-xl px-4 py-3">
          <input
            id="travel-time"
            type="range"
            min={10}
            max={120}
            step={5}
            value={filters.maxTravelTime}
            onChange={(e) => update({ maxTravelTime: Number(e.target.value) })}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] font-semibold text-ink-faint mt-1">
            <span>10 min</span>
            <span>2 hrs</span>
          </div>
        </div>
      </div>
    </form>
  );
}
