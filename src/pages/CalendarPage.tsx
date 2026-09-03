import { addMonths, format, isSameDay, subMonths } from "date-fns";
import { ko } from "date-fns/locale";
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { admissionGuides } from "../data/admissionGuides";
import { AgendaPanel } from "../components/AgendaPanel";
import { CalendarGrid } from "../components/CalendarGrid";
import { EventDialog } from "../components/EventDialog";
import { FilterPanel } from "../components/FilterPanel";
import { ALL_CATEGORIES, usePreferences } from "../hooks/usePreferences";
import { useAdmissions } from "../hooks/useAdmissions";
import { isDateInRange, toDateKey } from "../lib/date";
import type { AdmissionEvent, AdmissionGuide } from "../types";

const guides = admissionGuides as Record<string, AdmissionGuide>;

export function CalendarPage() {
  const { events, loading, error } = useAdmissions();
  const today = new Date();
  const todayKey = toDateKey(today);
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [selectedEvent, setSelectedEvent] = useState<AdmissionEvent | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  const universities = useMemo(
    () => [...new Set(events.map((event) => event.university))].sort((a, b) => a.localeCompare(b, "ko")),
    [events],
  );
  const preferences = usePreferences(universities);

  const visibleEvents = useMemo(
    () =>
      events.filter(
        (event) =>
          preferences.selectedUniversitySet.has(event.university) &&
          preferences.selectedCategorySet.has(event.category),
      ),
    [events, preferences.selectedCategorySet, preferences.selectedUniversitySet],
  );

  const selectedEvents = useMemo(
    () => visibleEvents.filter((event) => isDateInRange(selectedDate, event.startDate, event.endDate)),
    [selectedDate, visibleEvents],
  );

  const upcomingEvents = useMemo(
    () =>
      visibleEvents
        .filter((event) => event.startDate > todayKey)
        .sort((a, b) => a.endDate.localeCompare(b.endDate) || a.startDate.localeCompare(b.startDate)),
    [todayKey, visibleEvents],
  );

  const selectDate = useCallback((date: string) => {
    setSelectedDate(date);
  }, []);

  const goToday = () => {
    setMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(todayKey);
  };

  const selectedDateObject = new Date(`${selectedDate}T12:00:00`);
  const selectedLabel = isSameDay(selectedDateObject, today)
    ? "TODAY"
    : format(selectedDateObject, "M월 d일 EEE", { locale: ko });

  return (
    <main className="calendar-page">
      <div className="calendar-layout">
        <FilterPanel
          universities={universities}
          selectedUniversities={preferences.selectedUniversities}
          selectedCategories={preferences.selectedCategories}
          guides={guides}
          onToggleUniversity={preferences.toggleUniversity}
          onSetUniversities={preferences.setSelectedUniversities}
          onToggleCategory={preferences.toggleCategory}
          mobileOpen={filterOpen}
          onCloseMobile={() => setFilterOpen(false)}
        />

        <section className="calendar-card" aria-label="월간 입시 일정">
          <header className="calendar-toolbar">
            <button className="filter-trigger" onClick={() => setFilterOpen(true)}>
              <SlidersHorizontal size={17} /> 필터
            </button>
            <div className="month-control">
              <button className="icon-button" onClick={() => setMonth((current) => subMonths(current, 1))} aria-label="이전 달">
                <ChevronLeft size={20} />
              </button>
              <h1>{format(month, "yyyy년 M월", { locale: ko })}</h1>
              <button className="icon-button" onClick={() => setMonth((current) => addMonths(current, 1))} aria-label="다음 달">
                <ChevronRight size={20} />
              </button>
            </div>
            <button className="today-button" onClick={goToday}>오늘</button>
          </header>

          {loading ? (
            <div className="calendar-state"><span className="loading-spinner" /> 일정 불러오는 중</div>
          ) : error ? (
            <div className="calendar-state calendar-state--error">일정을 불러오지 못했습니다.</div>
          ) : (
            <CalendarGrid
              month={month}
              events={visibleEvents}
              selectedDate={selectedDate}
              onSelectDate={selectDate}
              onSelectEvent={setSelectedEvent}
            />
          )}

          <div className="calendar-legend" aria-label="일정 종류">
            {ALL_CATEGORIES.filter((category) => category !== "기타").map((category) => (
              <span key={category} className={`category-${category.replace(/\s/g, "-")}`}>
                <i /> {category}
              </span>
            ))}
          </div>
        </section>

        <AgendaPanel
          selectedEvents={selectedEvents}
          selectedLabel={selectedLabel}
          upcomingEvents={upcomingEvents}
          guides={guides}
          onSelectEvent={setSelectedEvent}
        />
      </div>

      <EventDialog
        event={selectedEvent}
        guide={selectedEvent ? guides[selectedEvent.university] : undefined}
        onClose={() => setSelectedEvent(null)}
      />
    </main>
  );
}

