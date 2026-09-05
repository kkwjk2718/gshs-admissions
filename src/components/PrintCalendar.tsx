import { endOfMonth, format, isSameMonth, startOfMonth } from "date-fns";
import { useAdmissions } from "../hooks/useAdmissions";
import { useCalendarMonth } from "../hooks/useCalendarMonth";
import { usePreferences } from "../hooks/usePreferences";
import { useVisibleEvents } from "../hooks/useVisibleEvents";
import { CATEGORY_UI } from "../lib/categories";
import { buildDayEntries } from "../lib/dayEntries";
import { getCalendarWeeks, toDateKey } from "../lib/date";
import { eventBadges } from "../lib/eventInfo";
import type { AdmissionEvent, AdmissionsDataset, CategoryId } from "../types";
import { PrintedSchedule } from "./PrintSchedule";

/** Keep full records, not dayEntries.lines.events: those are one representative per university. */
export function buildPrintCalendar(input: AdmissionEvent[], universities: string[], categories: CategoryId[], month: Date) {
  const first = toDateKey(startOfMonth(month));
  const last = toDateKey(endOfMonth(month));
  const events = input.filter(e => universities.includes(e.university) && categories.includes(e.categoryId) && e.startDate <= last && e.deadlineDate >= first)
    .sort((a, b) => a.startDate.localeCompare(b.startDate) || a.deadlineDate.localeCompare(b.deadlineDate) || a.university.localeCompare(b.university, "ko") || a.id.localeCompare(b.id));
  const numbers = new Map(events.map((e, i) => [e.id, i + 1]));
  const weeks = getCalendarWeeks(month).map(week => week.map(date => {
    const key = toDateKey(date);
    const inside = isSameMonth(date, month);
    const entries = inside ? buildDayEntries(events, key) : [];
    const active = inside ? events.filter(e => e.deadlineDate === key || (e.isDateRange && e.startDate <= key && e.deadlineDate >= key)) : [];
    const ongoing = active.filter(e => e.startDate < key && e.deadlineDate > key);
    return { date, key, inside, entries, active, ongoing };
  }));
  return { events, numbers, weeks };
}
interface Props {
  dataset: AdmissionsDataset | null; status: "loading" | "ready" | "error"; offlineSavedAt: string | null;
  events: AdmissionEvent[]; universities: string[]; categories: CategoryId[]; month: Date; monthSource: string;
}
export function PrintCalendarDocument({ dataset, status, offlineSavedAt, events: input, universities, categories, month, monthSource }: Props) {
  const { events, numbers, weeks } = buildPrintCalendar(status === "ready" && dataset ? input : [], universities, categories, month);
  const monthLabel = format(month, "yyyy년 M월");
  const reference = (items: AdmissionEvent[]) => {
    const ids = items.map(e => numbers.get(e.id));
    return ids.slice(0, 3).map(id => `#${id}`).join("·") + (ids.length > 3 ? ` 외 ${ids.length - 3}건` : "");
  };
  return <article className="print-document print-calendar" lang="ko" aria-label="선택 대학 월간 인쇄 달력" data-print-month={format(month, "yyyy-MM")}>
    <header className="print-document__header">
      <p className="print-document__eyebrow">GSHS · ADMISSIONS / MONTHLY CALENDAR</p>
      <h1>{monthLabel} 수시 일정 달력</h1>
      <p className="print-document__selection"><strong>선택 대학 {universities.length}곳</strong> · {universities.join(" / ") || "선택 없음"}</p>
      <p className="print-document__help">{monthSource} · 이번 달만 / 일정 종류: {categories.map(id => CATEGORY_UI[id].label).join(" / ") || "선택 없음"}</p>
      <p className="print-document__help">화면과 같은 대학·일정 종류 필터 적용. 대학 검색어는 선택창 검색용입니다. 이웃 달은 빈칸으로 표시합니다.</p>
      <p className="print-document__help">날짜 칸은 개요입니다. #번호 → 뒤의 전체 일정 상세. ‘외’ 일정도 상세에 모두 포함됩니다. 시각·‘이전’·소인·제외일은 원문을 확인하세요.</p>
      {offlineSavedAt && <p className="print-document__warning">오프라인 저장된 자료입니다. 최신 변경 사항은 대학 홈페이지에서 확인하세요.</p>}
    </header>
    {!universities.length ? <p className="print-document__empty">선택한 대학이 없습니다. ‘내 대학’에서 대학을 선택하세요.</p>
      : status !== "ready" || !dataset ? <p className="print-document__empty">{status === "error" ? "일정 자료를 불러오지 못했습니다." : "일정 자료를 불러오는 중입니다."}</p> : <>
      {!events.length && <p className="print-document__empty">이 월과 선택한 일정 종류에 해당하는 일정이 없습니다.</p>}
      <table className="print-month-grid" aria-label={`${monthLabel} 월간 개요`}>
        <thead><tr>{["일", "월", "화", "수", "목", "금", "토"].map(d => <th scope="col" key={d}>{d}</th>)}</tr></thead>
        <tbody>{weeks.map(week => <tr key={week[0].key}>{week.map(day => <td key={day.key} data-print-day={day.key}>
          {day.inside && <><strong className="print-day-number">{format(day.date, "d")}</strong>
            {day.entries.slice(0, 2).map(entry => {
              const matching = day.active.filter(e => buildDayEntries([e], day.key).some(single => single.id === entry.id));
              return <p className="print-day-summary" key={entry.id}><b>{entry.label}</b><span>{[...new Set(entry.lines.flatMap(line => line.universities))].slice(0, 3).join("·")}{new Set(entry.lines.flatMap(line => line.universities)).size > 3 ? " 외" : ""} ({entry.count}건)</span><span>{reference(matching)}</span></p>;
            })}
            {day.entries.length > 2 && <p className="print-day-more">외 {day.entries.length - 2}종 · 전체 상세 확인</p>}
            {day.ongoing.length > 0 && <p className="print-day-more">진행 중 {day.ongoing.length}건 · {reference(day.ongoing)}</p>}
          </>}
        </td>)}</tr>)}</tbody>
      </table>
      {events.length > 0 && <section className="print-calendar-details">
        <h2>{monthLabel} · 전체 일정 상세 ({events.length}건)</h2>
        <table className="print-table"><colgroup><col style={{width: "7%"}} /><col style={{width: "17%"}} /><col style={{width: "29%"}} /><col /></colgroup>
          <thead><tr><th scope="col">번호</th><th scope="col">대학 · 일정</th><th scope="col">전형 · 해당 날짜</th><th scope="col">원문 날짜·시각·조건</th></tr></thead>
          <tbody>{events.map(e => <tr key={e.id} data-print-event-id={e.id} data-print-university={e.university}>
            <th scope="row">#{numbers.get(e.id)}</th><td><strong>{e.university}</strong><br />{e.category}</td>
            <td>{e.admissionDetail || "전형명 미표기"}<small className="print-event-date">{e.isDateRange ? `기간: ${e.startDate} ~ ${e.deadlineDate}` : `해당일: ${e.deadlineDate}`}</small></td>
            <td><PrintedSchedule raw={e.rawSchedule} />{eventBadges(e).length > 0 && <small className="print-event-date">{eventBadges(e).join(" · ")}</small>}{e.excludedDates.length > 0 && <small className="print-exclusions">제외일: {e.excludedDates.join(", ")}</small>}{e.note && <small className="print-event-date">{e.note}</small>}</td>
          </tr>)}</tbody>
        </table>
      </section>}
    </>}
    <footer className="print-document__footer"><strong>참고용 · 지원 전 대학 홈페이지와 모집요강에서 반드시 최종 확인하세요.</strong><p>{dataset?.meta.notice}</p><p>자료: https://admissions.gshs.app · 한국 시간 기준 · 미표기 시각은 추정하지 않습니다.</p></footer>
  </article>;
}
export function PrintCalendar() {
  const { dataset, status, offlineSavedAt } = useAdmissions();
  const { universities, categories } = usePreferences();
  const events = useVisibleEvents();
  const { month, monthSource } = useCalendarMonth();
  return <PrintCalendarDocument {...{dataset, status, offlineSavedAt, universities, categories, events, month, monthSource}} />;
}
