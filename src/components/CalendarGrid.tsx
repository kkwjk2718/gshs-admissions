import { format, isSameDay, isSameMonth } from "date-fns";
import { ko } from "date-fns/locale";
import { useRef } from "react";
import { useIsCompact } from "../hooks/useMediaQuery";
import { CATEGORY_UI, categoryClass } from "../lib/categories";
import { getCalendarWeeks, isDateInRange, toDateKey, todayKey } from "../lib/date";
import type { AdmissionEvent } from "../types";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const MAX_CHIPS = 3;
const MAX_DOTS = 4;

interface CalendarGridProps {
  month: Date;
  events: AdmissionEvent[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onSelectEvent: (event: AdmissionEvent) => void;
}

interface DayBucket {
  deadlines: AdmissionEvent[];
  ongoing: number;
}

function bucketByDay(events: AdmissionEvent[]) {
  const buckets = new Map<string, DayBucket>();
  const ensure = (key: string) => {
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = { deadlines: [], ongoing: 0 };
      buckets.set(key, bucket);
    }
    return bucket;
  };

  for (const event of events) {
    ensure(event.deadlineDate).deadlines.push(event);
  }
  return { buckets, ensure };
}

export function CalendarGrid({ month, events, selectedDate, onSelectDate, onSelectEvent }: CalendarGridProps) {
  const compact = useIsCompact();
  const gridRef = useRef<HTMLDivElement>(null);
  const weeks = getCalendarWeeks(month);
  const today = todayKey();

  // 마감은 그 날 셀에만 그린다. 기간 중간 날에 같은 칩을 반복하면
  // 아무 마감도 없는 날이 가장 빽빽해 보인다.
  const { buckets, ensure } = bucketByDay(events);
  for (const week of weeks) {
    for (const day of week) {
      const key = toDateKey(day);
      const ongoing = events.filter(
        (event) => event.isDateRange && event.deadlineDate !== key && isDateInRange(key, event.startDate, event.deadlineDate),
      ).length;
      if (ongoing > 0) ensure(key).ongoing = ongoing;
    }
  }

  const moveFocus = (from: string, deltaDays: number) => {
    const date = new Date(`${from}T12:00:00`);
    date.setDate(date.getDate() + deltaDays);
    const next = toDateKey(date);
    onSelectDate(next);
    requestAnimationFrame(() => {
      gridRef.current?.querySelector<HTMLElement>(`[data-day="${next}"] .day-number`)?.focus();
    });
  };

  const handleKeyDown = (keyEvent: React.KeyboardEvent<HTMLDivElement>) => {
    const deltas: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
    };
    const delta = deltas[keyEvent.key];
    if (delta === undefined) return;
    keyEvent.preventDefault();
    moveFocus(selectedDate, delta);
  };

  return (
    <div className="calendar" ref={gridRef} onKeyDown={handleKeyDown}>
      <div className="calendar__weekdays" aria-hidden="true">
        {WEEKDAYS.map((weekday, index) => (
          <span key={weekday} className={index === 0 ? "is-sunday" : index === 6 ? "is-saturday" : ""}>
            {weekday}
          </span>
        ))}
      </div>

      <div className="calendar__grid" role="grid" aria-label="월간 일정">
        {weeks.map((week) => (
          <div className="calendar__week" role="row" key={toDateKey(week[0])}>
            {week.map((day) => {
              const key = toDateKey(day);
              const bucket = buckets.get(key);
              const deadlines = bucket?.deadlines ?? [];
              const ongoing = bucket?.ongoing ?? 0;
              const outside = !isSameMonth(day, month);
              const overflow = deadlines.length - MAX_CHIPS;

              return (
                <div
                  key={key}
                  role="gridcell"
                  data-day={key}
                  aria-selected={key === selectedDate}
                  className={[
                    "calendar__day",
                    outside ? "is-outside" : "",
                    key === selectedDate ? "is-selected" : "",
                    ongoing > 0 ? "has-ongoing" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => onSelectDate(key)}
                >
                  <button
                    type="button"
                    className={`day-number ${isSameDay(day, new Date(`${today}T12:00:00`)) ? "is-today" : ""}`}
                    tabIndex={key === selectedDate ? 0 : -1}
                    onClick={(clickEvent) => {
                      clickEvent.stopPropagation();
                      onSelectDate(key);
                    }}
                    aria-label={`${format(day, "M월 d일 EEEE", { locale: ko })}${
                      deadlines.length ? `, 마감 ${deadlines.length}건` : ""
                    }${ongoing ? `, 진행 중 ${ongoing}건` : ""}`}
                  >
                    {outside ? format(day, "M/d") : format(day, "d")}
                  </button>

                  {!compact && ongoing > 0 && <span className="day-ongoing">진행 {ongoing}</span>}

                  {compact ? (
                    <span className="day-dots" aria-hidden="true">
                      {deadlines.length > MAX_DOTS ? (
                        <span className={`day-count ${categoryClass(deadlines[0].categoryId)}`}>
                          {deadlines.length}
                        </span>
                      ) : (
                        deadlines.map((event) => (
                          <span className={`day-dot ${categoryClass(event.categoryId)}`} key={event.id} />
                        ))
                      )}
                    </span>
                  ) : (
                    <div className="day-chips">
                      {deadlines.slice(0, MAX_CHIPS).map((event) => {
                        const meta = CATEGORY_UI[event.categoryId];
                        const Icon = meta.icon;
                        return (
                          <button
                            type="button"
                            key={event.id}
                            className={`day-chip ${categoryClass(event.categoryId)}`}
                            tabIndex={-1}
                            onClick={(clickEvent) => {
                              clickEvent.stopPropagation();
                              onSelectEvent(event);
                            }}
                            title={`${event.university} ${meta.label} ${event.timeLabels[0] ?? ""}`.trim()}
                            aria-label={`${event.university} ${meta.label} 자세히 보기`}
                          >
                            <Icon size={14} aria-hidden="true" />
                            <span className="day-chip__name">{event.university}</span>
                          </button>
                        );
                      })}
                      {overflow > 0 && (
                        <button
                          type="button"
                          className="day-more"
                          tabIndex={-1}
                          aria-label={`${format(day, "M월 d일", { locale: ko })} 마감 ${overflow}건 더 보기`}
                          onClick={(clickEvent) => {
                            clickEvent.stopPropagation();
                            onSelectDate(key);
                          }}
                        >
                          +{overflow}건
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
