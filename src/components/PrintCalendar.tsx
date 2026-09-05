import { endOfMonth, format, isSameMonth, startOfMonth } from "date-fns";
import type { CSSProperties } from "react";
import { useAdmissions } from "../hooks/useAdmissions";
import { useCalendarMonth } from "../hooks/useCalendarMonth";
import { usePreferences } from "../hooks/usePreferences";
import { useVisibleEvents } from "../hooks/useVisibleEvents";
import { CATEGORY_UI } from "../lib/categories";
import { buildDayEntries } from "../lib/dayEntries";
import { getCalendarWeeks, toDateKey } from "../lib/date";
import type { AdmissionEvent, AdmissionsDataset, CategoryId } from "../types";

/** Full filtered records drive counts; printed calendar is explicitly a one-page summary. */
export function buildPrintCalendar(input: AdmissionEvent[], universities: string[], categories: CategoryId[], month: Date) {
  const first = toDateKey(startOfMonth(month));
  const last = toDateKey(endOfMonth(month));
  const events = input.filter(e => universities.includes(e.university) && categories.includes(e.categoryId) && e.startDate <= last && e.deadlineDate >= first)
    .sort((a, b) => a.startDate.localeCompare(b.startDate) || a.deadlineDate.localeCompare(b.deadlineDate) || a.university.localeCompare(b.university, "ko") || a.id.localeCompare(b.id));
  const weeks = getCalendarWeeks(month).map(week => week.map(date => {
    const key = toDateKey(date);
    const inside = isSameMonth(date, month);
    const entries = inside ? buildDayEntries(events, key) : [];
    const active = inside ? events.filter(e => e.deadlineDate === key || (e.isDateRange && e.startDate <= key && e.deadlineDate >= key)) : [];
    const ongoing = active.filter(e => e.startDate < key && e.deadlineDate > key);
    return { date, key, inside, entries, active, ongoing };
  }));
  return { events, weeks };
}
interface Props {
  dataset: AdmissionsDataset | null; status: "loading" | "ready" | "error"; offlineSavedAt: string | null;
  events: AdmissionEvent[]; universities: string[]; categories: CategoryId[]; month: Date; monthSource: string;
}
export function PrintCalendarDocument({ dataset, status, offlineSavedAt, events: input, universities, categories, month, monthSource }: Props) {
  const { events, weeks } = buildPrintCalendar(status === "ready" && dataset ? input : [], universities, categories, month);
  const monthLabel = format(month, "yyyy년 M월");
  const selectedLabel = universities.slice(0, 8).join(" / ") + (universities.length > 8 ? ` 외 ${universities.length - 8}곳` : "");
  const unavailable = !universities.length ? "선택한 대학이 없습니다. ‘내 대학’에서 대학을 선택하세요."
    : status !== "ready" || !dataset ? (status === "error" ? "일정 자료를 불러오지 못했습니다." : "일정 자료를 불러오는 중입니다.")
    : !events.length ? "이 월과 선택한 일정 종류에 해당하는 일정이 없습니다." : null;
  return <article className="print-document print-calendar" lang="ko" aria-label="선택 대학 월간 인쇄 달력" data-print-month={format(month, "yyyy-MM")} data-print-event-count={events.length} style={{"--print-week-count": weeks.length} as CSSProperties}>
    <header className="print-document__header">
      <p className="print-document__eyebrow">GSHS · ADMISSIONS / 한 달 · 한 장</p>
      <div className="print-month-mark" aria-hidden="true"><strong>{format(month, "MM")}</strong><span>{format(month, "yyyy")} / MONTH</span></div>
      <h1>{monthLabel} 수시 일정 달력</h1>
      <p className="print-document__selection"><strong>선택 대학 {universities.length}곳</strong> · {selectedLabel || "선택 없음"}</p>
      <p className="print-document__help">{monthSource} · {categories.length === dataset?.categories.length ? "모든 일정 종류" : categories.map(id => CATEGORY_UI[id].label).join(" / ") || "선택 없음"} · 이달 {events.length}개 일정</p>
      {unavailable && <p className="print-calendar-status">{unavailable}</p>}
    </header>
    <table className="print-month-grid" aria-label={`${monthLabel} 월간 개요`}>
      <thead><tr>{["일", "월", "화", "수", "목", "금", "토"].map((d, index) => <th scope="col" key={d} data-weekday={index}>{d}</th>)}</tr></thead>
      <tbody>{weeks.map(week => <tr key={week[0].key}>{week.map(day => <td key={day.key} data-print-day={day.key} data-weekday={day.date.getDay()} data-outside-month={!day.inside} data-has-entries={day.entries.length > 0}>
        {day.inside && <><strong className="print-day-number">{format(day.date, "d")}</strong>
          {day.entries.slice(0, 2).map(entry => {
            const schools = [...new Set(entry.lines.flatMap(line => line.universities))];
            return <p className="print-day-summary" data-print-phase={entry.phase} key={entry.id}><b>{entry.label} <small>{entry.count}</small></b><span>{schools.slice(0, 2).join("·")}{schools.length > 2 ? ` 외 ${schools.length - 2}곳` : ""}</span></p>;
          })}
          {(day.entries.length > 2 || day.ongoing.length > 0) && <p className="print-day-more">{[day.entries.length > 2 ? `외 ${day.entries.length - 2}종` : "", day.ongoing.length ? `진행 중 ${day.ongoing.length}건` : ""].filter(Boolean).join(" · ")}</p>}
        </>}
      </td>)}</tr>)}</tbody>
    </table>
    <footer className="print-document__footer">
      <strong>월간 요약 · 전형·시각·‘이전’·제외일 등 상세 조건은 ‘대학별 전체 일정’으로 별도 인쇄하세요.</strong>
      <p>{offlineSavedAt ? "오프라인 저장 자료 · " : ""}칸마다 최대 2종·대학 2곳을 표시하고 나머지는 ‘외’로 집계합니다. 진행 중에는 제외일이 있을 수 있습니다. 대학 모집요강 최종 확인 · admissions.gshs.app</p>
    </footer>
  </article>;
}
export function PrintCalendar() {
  const { dataset, status, offlineSavedAt } = useAdmissions();
  const { universities, categories } = usePreferences();
  const events = useVisibleEvents();
  const { month, monthSource } = useCalendarMonth();
  return <PrintCalendarDocument {...{dataset, status, offlineSavedAt, universities, categories, events, month, monthSource}} />;
}
