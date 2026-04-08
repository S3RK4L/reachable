import type { ReachableEvent } from '../types/event';
import EventCard from './EventCard';

interface EventListProps {
  events: ReachableEvent[];
}

export default function EventList({ events }: EventListProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-20 px-6">
        <div className="text-5xl mb-4">📍</div>
        <p className="text-lg font-bold text-ink">
          Nothing reachable yet
        </p>
        <p className="text-ink-muted text-sm mt-2 max-w-xs mx-auto">
          Try bumping up the max journey time or searching from a different starting point.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
