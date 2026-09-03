import { addMonths, format, subMonths } from "date-fns";
import { ko } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CalendarGrid } from "../components/CalendarGrid";
import { EventDetailDialog } from "../components/EventDetailDialog";
import { EventRow } from "../components/EventRow";
import { PickUniversities } from "../components/PickUniversities";
import { SiteFooter } from "../components/SiteFooter";
import { EmptySelection, ErrorState, LoadingState, OfflineBanner } from "../components/StateNotices";
import { useAdmissions } from "../hooks/useAdmissions";
import { usePreferences } from "../hooks/usePreferences";
import { useVisibleEvents } from "../hooks/useVisibleEvents";
import { formatDayLabel, getCalendarWeeks, isDateInRange, toDateKey, todayKey } from "../lib/date";
import type { AdmissionEvent } from "../types";

const DATE_PARAM = /^\d{4}-\d{2}-\d{2}$/;

export function CalendarPage() {
  const { status } = useAdmissions();
  const { universities, categories } = usePreferences();
  const visibleEvents = useVisibleEvents();
  const [params] = useSearchParams();
  const today = todayKey();

  const initialDate = DATE_PARAM.test(params.get("d") ?? "") ? (params.get("d") as string) : today;
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [month, setMonth] = useState(() => new Date(`${initialDate}T12:00:00`));
  const [selectedEvent, setSelectedEvent] = useState<AdmissionEvent | null>(null);

  const dueToday = useMemo(
    () => visibleEvents.filter((event) => event.deadlineDate === selectedDate),
    [selectedDate, visibleEvents],
  );
  // 달력 칸과 같은 기준으로 나눈다. 시작을 "진행 중"에 섞으면 칸과 패널이 서로 다른 말을 한다.
  const starting = useMemo(
    () =>
      visibleEvents.filter(
        (event) => event.isDateRange && event.startDate === selectedDate && event.deadlineDate !== selectedDate,
      ),
    [selectedDate, visibleEvents],
  );
  const ongoing = useMemo(
    () =>
      visibleEvents.filter(
        (event) =>
          event.startDate !== selectedDate &&
          event.deadlineDate !== selectedDate &&
          isDateInRange(selectedDate, event.startDate, event.deadlineDate),
      ),
    [selectedDate, visibleEvents],
  );

  /** 방향키로 격자 밖까지 이동하면 달도 함께 넘긴다. 안 그러면 포커스가 사라진다. */
  const selectDate = useCallback((date: string) => {
    setSelectedDate(date);
    setMonth((current) => {
      const weeks = getCalendarWeeks(current);
      const firstDay = toDateKey(weeks[0][0]);
      const lastDay = toDateKey(weeks[weeks.length - 1][6]);
      return date >= firstDay && date <= lastDay ? current : new Date(`${date}T12:00:00`);
    });
  }, []);

  const goToday = () => {
    setSelectedDate(today);
    setMonth(new Date(`${today}T12:00:00`));
  };

  const shiftMonth = (delta: number) => {
    setMonth((current) => (delta > 0 ? addMonths(current, 1) : subMonths(current, 1)));
  };

  if (status === "loading") {
    return (
      <main className="page page--calendar">
        <LoadingState />
      </main>
    );
  }
  if (status === "error") {
    return (
      <main className="page page--calendar">
        <ErrorState />
      </main>
    );
  }

  return (
    <main className="page page--calendar">
      <OfflineBanner />
      <h1 className="sr-only">2027 수시 일정 달력</h1>
      <PickUniversities />

      {universities.length === 0 || categories.length === 0 ? (
        <EmptySelection />
      ) : (
        <div className="calendar-layout">
          <section className="calendar-card">
            <header className="calendar-toolbar">
              <div className="month-control">
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => shiftMonth(-1)}
                  aria-label={`${format(subMonths(month, 1), "yyyy년 M월", { locale: ko })} 보기`}
                >
                  <ChevronLeft size={22} />
                </button>
                <h2>{format(month, "yyyy년 M월", { locale: ko })}</h2>
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => shiftMonth(1)}
                  aria-label={`${format(addMonths(month, 1), "yyyy년 M월", { locale: ko })} 보기`}
                >
                  <ChevronRight size={22} />
                </button>
              </div>
              <button type="button" className="button" onClick={goToday}>
                오늘
              </button>
            </header>

            <CalendarGrid
              month={month}
              events={visibleEvents}
              selectedDate={selectedDate}
              onSelectDate={selectDate}
              onSelectEvent={setSelectedEvent}
            />

            <p className="calendar-hint">
              <span className="calendar-hint__key" aria-hidden="true" />
              마감·발표·면접
              <span className="calendar-hint__key is-start" aria-hidden="true" />
              시작
            </p>
          </section>

          <section className="day-panel" aria-label="선택한 날의 일정">
            <h2 className="day-panel__head">
              {formatDayLabel(selectedDate)}
              {selectedDate === today && <span className="tag tag--today">오늘</span>}
            </h2>

            <h3 className="day-panel__section">마감·발표·면접 {dueToday.length}건</h3>
            {dueToday.length > 0 && (
              <div className="day-panel__list">
                {dueToday.map((event) => (
                  <EventRow key={event.id} event={event} onSelect={setSelectedEvent} showDday today={today} />
                ))}
              </div>
            )}

            {starting.length > 0 && (
              <>
                <h3 className="day-panel__section">시작 {starting.length}건</h3>
                <div className="day-panel__list">
                  {starting.map((event) => (
                    <EventRow key={event.id} event={event} onSelect={setSelectedEvent} showDday today={today} />
                  ))}
                </div>
              </>
            )}

            {ongoing.length > 0 && (
              <>
                <h3 className="day-panel__section">진행 중 {ongoing.length}건</h3>
                <div className="day-panel__list">
                  {ongoing.map((event) => (
                    <EventRow key={event.id} event={event} onSelect={setSelectedEvent} showDday today={today} />
                  ))}
                </div>
              </>
            )}
          </section>
        </div>
      )}

      <SiteFooter />
      <EventDetailDialog event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </main>
  );
}
