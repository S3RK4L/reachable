import { useEffect, useRef, useState } from 'react';
import type { ReachableEvent } from '../types/event';

function formatDate(isoDate: string): string {
  const d = new Date(isoDate);
  const day = d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  return `${day} · ${time}`;
}

interface ReachLevel {
  label: string;
  barColor: string;
}

function getReachLevel(minutes: number): ReachLevel {
  if (minutes <= 30) return { label: 'Really reachable', barColor: 'bg-mint' };
  if (minutes <= 60) return { label: 'Reachable', barColor: 'bg-ocean' };
  return { label: 'Hardly reachable', barColor: 'bg-pop' };
}

/** Percentage of the bar to fill — closer events fill more. Capped 120 min = 8%, 0 min = 100%. */
function barWidth(minutes: number): number {
  return Math.max(8, Math.min(100, ((120 - minutes) / 120) * 100));
}

interface EventCardProps {
  event: ReachableEvent;
}

export default function EventCard({ event }: EventCardProps) {
  const travelMin = event.travelTimeMinutes;
  const primaryMin = travelMin ?? 0;
  const reach = getReachLevel(primaryMin);

  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <article
      ref={ref}
      className="group bg-surface rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
    >
      {/* Animated reachability bar */}
      <div className="h-1.5 bg-slate-100 rounded-t-2xl overflow-hidden">
        <div
          className={`h-full ${reach.barColor} rounded-r-full transition-all duration-700 ease-out`}
          style={{ width: visible ? `${barWidth(primaryMin)}%` : '0%' }}
        />
      </div>

      <div className="p-5 flex flex-col gap-3">
        {/* Reach label + source */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-ink-muted">
            {reach.label}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-ink-faint">
            {event.source}
          </span>
        </div>

        {/* Event name */}
        <h3 className="text-lg font-extrabold text-ink leading-snug tracking-tight group-hover:text-ocean transition-colors">
          {event.name}
        </h3>

        {/* Venue */}
        <div className="flex items-center gap-2 text-sm text-ink-light">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-pop shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          {event.venue.name}
        </div>

        {/* Date */}
        <div className="text-xs font-semibold text-ink-muted">
          {formatDate(event.date)}
        </div>

        {/* Travel chips + CTA */}
        <div className="flex items-center justify-between pt-3 mt-auto border-t border-slate-100">
          <div className="flex gap-2">
            {travelMin != null && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-light bg-page rounded-full px-3 py-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-pop" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                </svg>
                {travelMin}m
              </span>
            )}
          </div>
          <a
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-ocean hover:text-ocean-light transition-colors"
          >
            Tickets →
          </a>
        </div>
      </div>
    </article>
  );
}
