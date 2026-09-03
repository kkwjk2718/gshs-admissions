import { ArrowUpRight, CalendarClock } from "lucide-react";
import { formatDday, formatEventRange } from "../lib/date";
import type { AdmissionEvent, AdmissionGuide } from "../types";
import { CategoryTag } from "./CategoryTag";

interface AgendaPanelProps {
  selectedEvents: AdmissionEvent[];
  selectedLabel: string;
  upcomingEvents: AdmissionEvent[];
  guides: Record<string, AdmissionGuide>;
  onSelectEvent: (event: AdmissionEvent) => void;
}

function AgendaItem({
  event,
  guide,
  showDday,
  onSelect,
}: {
  event: AdmissionEvent;
  guide?: AdmissionGuide;
  showDday?: boolean;
  onSelect: () => void;
}) {
  return (
    <article className="agenda-item">
      <button className="agenda-item__main" onClick={onSelect}>
        <div className="agenda-item__topline">
          <span className="university-tag">{event.university}</span>
          <CategoryTag category={event.category} />
          {showDday && <strong className="dday">{formatDday(event.endDate)}</strong>}
        </div>
        <h3>{event.title}</h3>
        <time>{formatEventRange(event.startDate, event.endDate)}</time>
      </button>
      {guide && (
        <a className="guide-link guide-link--compact" href={guide.url} target="_blank" rel="noreferrer">
          입시 요강 <ArrowUpRight size={13} />
        </a>
      )}
    </article>
  );
}

export function AgendaPanel({ selectedEvents, selectedLabel, upcomingEvents, guides, onSelectEvent }: AgendaPanelProps) {
  return (
    <aside className="agenda-panel" aria-label="주요 일정">
      <section className="agenda-section agenda-section--today">
        <div className="agenda-heading">
          <span className="eyebrow">{selectedLabel}</span>
          <span className="agenda-heading__count">{selectedEvents.length}</span>
        </div>
        {selectedEvents.length ? (
          <div className="agenda-list">
            {selectedEvents.map((event) => (
              <AgendaItem
                event={event}
                guide={guides[event.university]}
                onSelect={() => onSelectEvent(event)}
                key={event.id}
              />
            ))}
          </div>
        ) : (
          <div className="empty-agenda">
            <CalendarClock size={18} />
            일정 없음
          </div>
        )}
      </section>

      <section className="agenda-section">
        <div className="agenda-heading">
          <span className="eyebrow">UPCOMING</span>
        </div>
        {upcomingEvents.length ? (
          <div className="agenda-list">
            {upcomingEvents.slice(0, 6).map((event) => (
              <AgendaItem
                event={event}
                guide={guides[event.university]}
                showDday
                onSelect={() => onSelectEvent(event)}
                key={event.id}
              />
            ))}
          </div>
        ) : (
          <div className="empty-agenda">예정된 일정 없음</div>
        )}
      </section>
    </aside>
  );
}
