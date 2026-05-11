import { useState, useMemo } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import SearchForm from './components/SearchForm';
import EventList from './components/EventList';
import { fetchEvents } from './lib/api';
import type { ReachableEvent } from './types/event';

interface SearchFilters {
  location: string;
  startDate: string;
  endDate: string;
  maxTravelTime: number;
}

function App() {
  const [filters, setFilters] = useState<SearchFilters>({
    location: '',
    startDate: '',
    endDate: '',
    maxTravelTime: 60,
  });

  const [events, setEvents] = useState<ReachableEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!filters.location || !filters.startDate || !filters.endDate) {
      setError('Please fill in location and both dates.');
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const results = await fetchEvents(
        filters.location,
        filters.startDate,
        filters.endDate,
      );
      setEvents(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = useMemo(() => {
    return events
      .filter((event) => {
        if (
          event.travelTimeMinutes != null &&
          event.travelTimeMinutes > filters.maxTravelTime
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        const aTime = a.travelTimeMinutes ?? Infinity;
        const bTime = b.travelTimeMinutes ?? Infinity;
        return aTime - bTime;
      });
  }, [events, filters.maxTravelTime]);

  return (
    <div className="min-h-screen bg-page">
      <Header />
      <Hero />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pb-16 space-y-8">
        <SearchForm
          filters={filters}
          onChange={setFilters}
          onSubmit={handleSearch}
          loading={loading}
        />

        {error && (
          <div className="bg-pop/10 text-pop border border-pop/30 rounded-xl px-4 py-3 text-sm font-semibold">
            {error}
          </div>
        )}

        <div className="flex items-baseline justify-between px-1">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-extrabold text-ink uppercase tracking-wider">
              Results
            </h2>
            <span className="text-xs font-bold text-surface bg-ink rounded-full px-2.5 py-0.5 tabular-nums">
              {filteredEvents.length}
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-semibold text-ink-faint">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1.5 rounded-full bg-mint" /> Really reachable
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1.5 rounded-full bg-ocean" /> Reachable
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1.5 rounded-full bg-pop" /> Hardly reachable
            </span>
          </div>
        </div>

        <EventList events={filteredEvents} />
      </main>
    </div>
  );
}

export default App;
