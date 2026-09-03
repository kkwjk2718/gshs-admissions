import { CalendarPlus, Download, TriangleAlert } from "lucide-react";
import { usePreferences } from "../hooks/usePreferences";
import { useVisibleEvents } from "../hooks/useVisibleEvents";
import { downloadIcs, subscriptionUrl } from "../lib/ics";

export function SiteFooter() {
  const { universities } = usePreferences();
  const visibleEvents = useVisibleEvents();

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

      <p className="site-footer__warning">
        <TriangleAlert size={20} aria-hidden="true" />
        일정은 바뀔 수 있습니다. 지원 전 입학처 모집요강에서 다시 확인하세요.
      </p>
    </footer>
  );
}
