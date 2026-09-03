import { format, isSameDay, isSameMonth } from "date-fns";
import { ko } from "date-fns/locale";
import { useRef } from "react";
import { useIsCompact } from "../hooks/useMediaQuery";
import { categoryClass } from "../lib/categories";
import { buildDayEntries, ongoingCountOn } from "../lib/dayEntries";
import { getCalendarWeeks, toDateKey, todayKey } from "../lib/date";
import type { AdmissionEvent } from "../types";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const MAX_DOTS = 4;

interface CalendarGridProps {
  month: Date;
  events: AdmissionEvent[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onSelectEvent: (event: AdmissionEvent) => void;
}

export function CalendarGrid({ month, events, selectedDate, onSelectDate, onSelectEvent }: CalendarGridProps) {
  const compact = useIsCompact();
  const gridRef = useRef<HTMLDivElement>(null);
  const weeks = getCalendarWeeks(month);
  const today = todayKey();

  // 달을 넘기면 선택일이 이 격자 밖으로 나갈 수 있다. 그때도 Tab 으로 들어올
  // 진입점이 하나는 남아 있어야 키보드로 달력을 계속 쓸 수 있다.
  const focusKey = weeks.flat().some((day) => toDateKey(day) === selectedDate)
    ? selectedDate
    : toDateKey(weeks[0].find((day) => isSameMonth(day, month)) ?? weeks[0][0]);

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
    const deltas: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    const delta = deltas[keyEvent.key];
    if (delta === undefined) return;
    keyEvent.preventDefault();
    moveFocus(focusKey, delta);
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
              const entries = buildDayEntries(events, key);
              const total = entries.reduce((sum, entry) => sum + entry.count, 0);
              const ongoing = ongoingCountOn(events, key);
              const outside = !isSameMonth(day, month);
              const summary = entries.map((entry) => `${entry.label} ${entry.count}건`).join(", ");

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
                  <div className="day-head">
                    <button
                      type="button"
                      className={`day-number ${key === today ? "is-today" : ""}`}
                      tabIndex={key === focusKey ? 0 : -1}
                      onClick={(clickEvent) => {
                        clickEvent.stopPropagation();
                        onSelectDate(key);
                      }}
                      aria-label={`${format(day, "M월 d일 EEEE", { locale: ko })}${summary ? `, ${summary}` : ""}${
                        ongoing ? `, 진행 중 ${ongoing}건` : ""
                      }`}
                    >
                      {outside ? format(day, "M/d") : format(day, "d")}
                    </button>
                    {!compact && ongoing > 0 && <span className="day-ongoing">진행 중 {ongoing}</span>}
                  </div>

                  {compact ? (
                    <span className="day-dots" aria-hidden="true">
                      {/* 점은 종류를 말하고 숫자는 규모를 말한다. 12월 18일 22건이 점 하나로 보이면 안 된다. */}
                      {entries.slice(0, total > entries.length ? MAX_DOTS - 1 : MAX_DOTS).map((entry) => (
                        <span
                          className={`day-dot ${categoryClass(entry.categoryId)} ${
                            entry.phase === "start" ? "is-start" : ""
                          }`}
                          key={entry.id}
                        />
                      ))}
                      {total > entries.length && <span className="day-total">{total}</span>}
                    </span>
                  ) : (
                    <div className="day-entries">
                      {entries.map((entry) => (
                        <div
                          className={`day-entry ${categoryClass(entry.categoryId)} ${
                            entry.phase === "start" ? "is-start" : "is-end"
                          }`}
                          key={entry.id}
                        >
                          <span className="day-entry__label">{entry.label}</span>
                          {entry.lines.map((line) => (
                            <span className="day-entry__line" key={line.time || "none"}>
                              {line.time && <b>{line.time}</b>}
                              {line.universities.map((name, index) => (
                                // 가운뎃점을 앞 이름에 붙여야 줄이 접힐 때 점만 다음 줄로 떨어지지 않는다.
                                <span className="uni" key={`${name}-${index}`}>
                                  <button
                                    type="button"
                                    className="uni-link"
                                    tabIndex={-1}
                                    onClick={(clickEvent) => {
                                      clickEvent.stopPropagation();
                                      // 한 대학이 그 줄에서 여러 건을 대표하면 하나를 고를 근거가 없다.
                                      // 그 날을 선택해 옆 목록이 전부 보여주게 한다.
                                      if (line.counts[index] > 1) onSelectDate(key);
                                      else onSelectEvent(line.events[index]);
                                    }}
                                  >
                                    {name}
                                  </button>
                                  {index < line.universities.length - 1 && <i aria-hidden="true">·</i>}
                                </span>
                              ))}
                            </span>
                          ))}
                        </div>
                      ))}
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
