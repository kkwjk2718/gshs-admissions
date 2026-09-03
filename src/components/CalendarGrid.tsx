import { format, isSameDay, isSameMonth } from "date-fns";
import { ko } from "date-fns/locale";
import { useEffect, useRef } from "react";
import { getCalendarDays, isDateInRange, toDateKey } from "../lib/date";
import type { AdmissionEvent } from "../types";
import { categoryClassName } from "./CategoryTag";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const MAX_VISIBLE_EVENTS = 3;

interface CalendarGridProps {
  month: Date;
  events: AdmissionEvent[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onSelectEvent: (event: AdmissionEvent) => void;
}

export function CalendarGrid({ month, events, selectedDate, onSelectDate, onSelectEvent }: CalendarGridProps) {
  const days = getCalendarDays(month);
  const today = new Date();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || container.clientWidth >= container.scrollWidth) return;
    const selectedCell = container.querySelector<HTMLElement>(`[data-date="${selectedDate}"]`);
    if (!selectedCell) return;
    container.scrollTo({
      left: Math.max(0, selectedCell.offsetLeft - (container.clientWidth - selectedCell.clientWidth) / 2),
      behavior: "smooth",
    });
  }, [month, selectedDate]);

  return (
    <div className="calendar-scroll" ref={scrollRef}>
      <div className="calendar-grid">
        {WEEKDAYS.map((weekday, index) => (
          <div className={`weekday ${index === 0 ? "is-sunday" : ""} ${index === 6 ? "is-saturday" : ""}`} key={weekday}>
            {weekday}
          </div>
        ))}

        {days.map((day) => {
          const dateKey = toDateKey(day);
          const dayEvents = events
            .filter((event) => isDateInRange(dateKey, event.startDate, event.endDate))
            .sort((a, b) => {
              const aRank = a.endDate === dateKey ? 0 : a.startDate === dateKey ? 1 : 2;
              const bRank = b.endDate === dateKey ? 0 : b.startDate === dateKey ? 1 : 2;
              return aRank - bRank || a.university.localeCompare(b.university, "ko");
            });
          const overflow = dayEvents.length - MAX_VISIBLE_EVENTS;
          const isSelected = dateKey === selectedDate;

          return (
            <div
              className={`calendar-day ${isSameMonth(day, month) ? "" : "is-outside"} ${isSelected ? "is-selected" : ""}`}
              key={dateKey}
              data-date={dateKey}
              onClick={() => onSelectDate(dateKey)}
            >
              <button
                className={`day-number ${isSameDay(day, today) ? "is-today" : ""}`}
                onClick={(event) => {
                  event.stopPropagation();
                  onSelectDate(dateKey);
                }}
                aria-label={`${format(day, "M월 d일 EEEE", { locale: ko })}${dayEvents.length ? `, 일정 ${dayEvents.length}개` : ""}`}
              >
                {format(day, "d")}
              </button>

              <div className="day-events">
                {dayEvents.slice(0, MAX_VISIBLE_EVENTS).map((event) => (
                  <button
                    className={`calendar-event ${categoryClassName(event.category)}`}
                    key={event.id}
                    onClick={(clickEvent) => {
                      clickEvent.stopPropagation();
                      onSelectEvent(event);
                    }}
                    title={`${event.university} ${event.title}`}
                  >
                    <span className="calendar-event__university">{event.university}</span>
                    <span className="calendar-event__title">{event.title}</span>
                  </button>
                ))}
                {overflow > 0 && (
                  <button className="calendar-more" onClick={() => onSelectDate(dateKey)}>
                    +{overflow}개
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
