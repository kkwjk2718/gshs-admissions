import { CalendarPlus, ExternalLink, SlidersHorizontal } from "lucide-react";
import { NavLink, Link } from "react-router-dom";
import { useFilterDialog } from "../hooks/useFilterDialog";
import { usePreferences } from "../hooks/usePreferences";
import { useVisibleEvents } from "../hooks/useVisibleEvents";
import { downloadIcs } from "../lib/ics";

export const NAV_ITEMS = [
  { to: "/", label: "남은 일정", end: true },
  { to: "/calendar", label: "달력", end: false },
  { to: "/schedule", label: "전형표", end: false },
];

export function AppHeader() {
  const { openDialog } = useFilterDialog();
  const { universities, isFiltered } = usePreferences();
  const visibleEvents = useVisibleEvents();

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <div className="brand">
          <a
            className="brand__home"
            href="https://gshs.app"
            target="_blank"
            rel="noreferrer"
            aria-label="GSHS.app 새 탭에서 열기"
          >
            <span className="brand__mark" aria-hidden="true">
              G
            </span>
            <span className="brand__name">GSHS.app</span>
            <ExternalLink size={13} aria-hidden="true" />
          </a>
          <span className="brand__divider" aria-hidden="true" />
          <Link className="brand__title" to="/">
            2027 수시 일정
          </Link>
        </div>

        <nav className="app-nav" aria-label="화면 이동">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="app-header__actions">
          <button
            type="button"
            className={`button button--filter ${isFiltered ? "is-active" : ""}`}
            onClick={openDialog}
          >
            <SlidersHorizontal size={16} aria-hidden="true" />내 대학 {universities.length}곳
          </button>
          <button
            type="button"
            className="button button--ghost app-header__export"
            onClick={() => downloadIcs(visibleEvents)}
            disabled={visibleEvents.length === 0}
            title="고른 대학의 일정을 .ics 파일로 내려받아요"
          >
            <CalendarPlus size={16} aria-hidden="true" />
            캘린더에 담기
          </button>
        </div>
      </div>
    </header>
  );
}
