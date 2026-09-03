import { CalendarPlus, Download } from "lucide-react";
import { admissionGuides } from "../data/admissionGuides";
import { useAdmissions } from "../hooks/useAdmissions";
import { usePreferences } from "../hooks/usePreferences";
import { useVisibleEvents } from "../hooks/useVisibleEvents";
import { downloadIcs, subscriptionUrl } from "../lib/ics";

const baseDate = Object.values(admissionGuides)[0]?.verifiedAt ?? "";

export function SiteFooter() {
  const { dataset } = useAdmissions();
  const { universities } = usePreferences();
  const visibleEvents = useVisibleEvents();
  const meta = dataset?.meta;

  return (
    <footer className="site-footer">
      <p className="site-footer__source">
        출처 「2027학년도 대입수시모집 전형일정」 · 「2027 대학입시 관련 달력」 PDF
        {baseDate && ` · ${baseDate.replace(/-/g, ". ")} 기준`}
      </p>
      <p>일정은 바뀔 수 있습니다. 지원 전 입학처 모집요강에서 다시 확인하세요.</p>
      {meta && (
        <p className="site-footer__coverage">
          대학 {meta.universityCount}곳 · 일정 {meta.eventCount}건 · 전형 {meta.tableRowCount}개
        </p>
      )}
      <div className="site-footer__actions">
        <button
          type="button"
          className="button"
          onClick={() => downloadIcs(visibleEvents)}
          disabled={visibleEvents.length === 0}
        >
          <Download size={16} aria-hidden="true" />내 대학 {universities.length}곳 내려받기
        </button>
        <a className="button button--ghost" href={subscriptionUrl()}>
          <CalendarPlus size={16} aria-hidden="true" />
          전체 일정 구독
        </a>
      </div>
      <p className="site-footer__hint">폰 캘린더에 넣으면 마감 3일 전·하루 전·당일 아침에 알림이 옵니다.</p>
    </footer>
  );
}
