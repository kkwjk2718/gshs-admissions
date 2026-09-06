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
        2026.9.6 검증 보고서 반영 · 대상 전형·모집단위와 개인별 기한을 확인하세요. DGIST 일부 일정은 미확인, 건국대·KAIST는 후속 공지 확인 한계가 있습니다. 지원 전 입학처에서 최종 확인하세요.
      </p>
      <p>ICS는 종일 일정이며 시각·예정·제출 기준은 제목과 설명을 확인해야 합니다. 구독 갱신 주기와 다운로드 알림 지원은 달력 앱에 따라 다릅니다.</p>
    </footer>
  );
}
