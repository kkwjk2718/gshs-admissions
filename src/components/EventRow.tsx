import { CATEGORY_UI, categoryClass } from "../lib/categories";
import { formatDday, formatRange, todayKey, urgencyOf } from "../lib/date";
import { deadlineTimeLabel, eventBadges, statusLabel, statusOf } from "../lib/eventInfo";
import { CategoryTag } from "./CategoryTag";
import type { AdmissionEvent } from "../types";

interface EventRowProps {
  event: AdmissionEvent;
  onSelect: (event: AdmissionEvent) => void;
  /** 날짜 그룹 안에 있으면 D-day가 헤더에 이미 있으므로 끈다 */
  showDday?: boolean;
  today?: string;
}

export function EventRow({ event, onSelect, showDday = false, today = todayKey() }: EventRowProps) {
  const meta = CATEGORY_UI[event.categoryId];
  const status = statusOf(event, today);
  const statusText = statusLabel(event, today);
  const time = deadlineTimeLabel(event);
  const badges = eventBadges(event);

  return (
    <button
      type="button"
      className={`event-row ${categoryClass(event.categoryId)}`}
      onClick={() => onSelect(event)}
      aria-label={`${event.university} ${meta.label} 자세히 보기`}
    >
      <span className="event-row__head">
        {statusText && <span className={`status status--${status}`}>{statusText}</span>}
        <span className="event-row__university">{event.university}</span>
        {/* 오늘 마감이면 왼쪽 상태칩이 이미 같은 말을 한다. 두 번 쓰지 않는다. */}
        {showDday && status !== "due-today" && (
          <span className={`dday dday--${urgencyOf(event.deadlineDate, today)}`}>
            {formatDday(event.deadlineDate, meta.noun, today)}
          </span>
        )}
      </span>

      <span className="event-row__meta">
        <CategoryTag id={event.categoryId} size="sm" />
        <span className="event-row__track">{event.admissionDetail}</span>
      </span>

      <span className="event-row__when">
        <span className="event-row__range">{formatRange(event.startDate, event.deadlineDate)}</span>
        {time ? <span className="event-row__time">{time}</span> : null}
      </span>

      <span className="event-row__schedule">{event.rawSchedule}</span>

      {badges.length > 0 && (
        <span className="event-row__badges">
          {badges.map((badge) => (
            <span className="badge" key={badge}>
              {badge}
            </span>
          ))}
        </span>
      )}
    </button>
  );
}
