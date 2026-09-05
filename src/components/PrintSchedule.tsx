import { useAdmissions } from "../hooks/useAdmissions";
import { usePreferences } from "../hooks/usePreferences";
import type { AdmissionEvent, AdmissionsDataset } from "../types";

export const PRINT_SCOPE = "선택한 대학의 전체 기간·모든 일정 종류를 인쇄합니다. 화면의 월·검색어·일정 종류 필터와 관계없이 포함됩니다.";

/** Deliberately accepts no screen/category filters, and never falls back to all universities. */
export function groupPrintEvents(events: AdmissionEvent[], universities: string[]) {
  return [...new Set(universities)].map((university) => ({
    university,
    events: events.filter((event) => event.university === university).sort((a, b) =>
      a.startDate.localeCompare(b.startDate) || a.deadlineDate.localeCompare(b.deadlineDate) ||
      a.category.localeCompare(b.category, "ko") || a.admissionDetail.localeCompare(b.admissionDetail, "ko")),
  }));
}

/** Style tokens in place: do not reformat, summarize or infer times from normalized dates. */
export function PrintedSchedule({ raw }: { raw: string }) {
  return <span className="print-schedule">{raw.split(/(\d{1,2}:\d{2}|(?:20\d{2}\.)?\d{1,2}\.\d{1,2}(?:\([월화수목금토일]\))?)/g)
    .map((part, index) => /\d/.test(part) && /^(?:\d{1,2}:\d{2}|(?:20\d{2}\.)?\d{1,2}\.\d{1,2}(?:\([월화수목금토일]\))?)$/.test(part)
      ? <strong key={index} className={part.includes(":") ? "print-time" : undefined}>{part}</strong>
      : part)}</span>;
}

interface PrintDocumentProps {
  dataset: AdmissionsDataset | null;
  universities: string[];
  status: "loading" | "ready" | "error";
  offlineSavedAt: string | null;
}

export function PrintDocument({ dataset, universities, status, offlineSavedAt }: PrintDocumentProps) {
  const groups = groupPrintEvents(status === "ready" ? dataset?.events ?? [] : [], universities);
  return (
    <article className="print-document" lang="ko" aria-label="선택 대학 A4 인쇄 일정표">
      <header className="print-document__header">
        <p className="print-document__eyebrow">GSHS · ADMISSIONS / MY SCHEDULE</p>
        <h1>{dataset ? `${dataset.meta.academicYear}학년도 ` : ""}수시 지원 일정</h1>
        <p className="print-document__selection"><strong>선택 대학 {groups.length}곳</strong>{groups.length > 0 && ` · ${groups.map(g => g.university).join(" / ")}`}</p>
        <p className="print-document__help">{PRINT_SCOPE}</p>
        {dataset && <p className="print-document__help">전체 자료 범위 {dataset.meta.dateRange.start} ~ {dataset.meta.dateRange.end} · 시각은 한국 시간 기준. 원문 날짜·조건을 함께 확인하세요.</p>}
        {offlineSavedAt && <p className="print-document__warning">오프라인 저장된 자료입니다. 최신 변경 사항은 대학 홈페이지에서 확인하세요.</p>}
      </header>
      {universities.length === 0 ? <p className="print-document__empty">선택한 대학이 없습니다. 화면의 ‘내 대학’에서 대학을 선택한 뒤 다시 인쇄하세요.</p>
        : status !== "ready" || !dataset ? <p className="print-document__empty">{status === "error" ? "일정 자료를 불러오지 못했습니다." : "일정 자료를 불러오는 중입니다."} 화면에서 자료를 확인한 뒤 다시 인쇄하세요.</p>
        : groups.map(({ university, events }, index) => (
          <section className="print-university" data-print-university={university} key={university}>
            <table className="print-table" aria-label={`${university} 전체 일정`}>
              <colgroup><col className="print-table__category" /><col className="print-table__track" /><col /></colgroup>
              {/* University title repeats with column headings, rather than being orphaned on the previous page. */}
              <thead><tr><th colSpan={3} className="print-table__university"><h2><b className="print-section-number">{String(index + 1).padStart(2, "0")}</b>{university}<span>{events.length}개 일정 · 시작일순</span></h2></th></tr>
                <tr><th scope="col">일정</th><th scope="col">전형</th><th scope="col">날짜·시각</th></tr></thead>
              <tbody>{events.length === 0 ? <tr><td colSpan={3}>이 대학의 등록된 일정이 없습니다.</td></tr> : events.map(event => (
                <tr key={event.id} data-print-event-id={event.id}>
                  <th scope="row"><span className="print-category-label">{event.category}</span></th>
                  <td>{event.admissionDetail || "전형명 미표기"}</td>
                  <td><PrintedSchedule raw={event.rawSchedule} />
                    {events.some(other => other.categoryId === event.categoryId && other.admissionDetail === event.admissionDetail && other.rawSchedule === event.rawSchedule && other.deadlineDate !== event.deadlineDate) && <small className="print-event-date">해당일: {event.deadlineDate}</small>}
                    {event.excludedDates.length > 0 && <small className="print-exclusions">제외일: {event.excludedDates.join(", ")}</small>}
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </section>
        ))}
      <footer className="print-document__footer">
        <strong>참고용 일정표 · 지원 전 대학 홈페이지와 모집요강에서 반드시 최종 확인하세요.</strong>
        <p>{dataset?.meta.notice ?? "일정은 변경될 수 있습니다."}</p>
        <p>자료: GSHS 수시 일정 · https://admissions.gshs.app · 날짜·시각은 자료의 원문 표기이며 미표기 시각은 추정하지 않습니다.</p>
      </footer>
    </article>
  );
}

/** Always mounted outside the screen shell: browser menu / Ctrl+P works on every route. */
export function PrintSchedule() {
  const { dataset, status, offlineSavedAt } = useAdmissions();
  const { universities } = usePreferences();
  return <PrintDocument dataset={dataset} status={status} offlineSavedAt={offlineSavedAt} universities={universities} />;
}
