import { CalendarPlus, Download } from "lucide-react";
import { useAdmissions } from "../hooks/useAdmissions";
import { usePreferences } from "../hooks/usePreferences";
import { useVisibleEvents } from "../hooks/useVisibleEvents";
import { downloadIcs, subscriptionUrl } from "../lib/ics";

export function SiteFooter() {
  const { dataset } = useAdmissions();
  const { universities } = usePreferences();
  const visibleEvents = useVisibleEvents();
  const meta = dataset?.meta;

  return (
    <footer className="site-footer">
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
      <p>
        일정은 바뀔 수 있습니다. 지원 전 입학처 모집요강에서 다시 확인하세요.
        {meta && ` · 대학 ${meta.universityCount}곳 · 일정 ${meta.eventCount}건`}
      </p>
    </footer>
  );
}
