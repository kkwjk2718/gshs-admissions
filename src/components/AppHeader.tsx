import { CalendarPlus, Moon, Printer, SlidersHorizontal, Sun } from "lucide-react";
import { useAdmissions } from "../hooks/useAdmissions";
import { PRINT_SCOPE } from "./PrintSchedule";
import { NavLink, Link } from "react-router-dom";
import { useFilterDialog } from "../hooks/useFilterDialog";
import { usePreferences } from "../hooks/usePreferences";
import { useTheme } from "../hooks/useTheme";
import { useVisibleEvents } from "../hooks/useVisibleEvents";
import { downloadIcs } from "../lib/ics";

export const NAV_ITEMS = [
  { to: "/", label: "달력", end: true },
  { to: "/deadlines", label: "남은 일정", end: false },
  { to: "/schedule", label: "전형표", end: false },
];

export function AppHeader() {
  const { openDialog } = useFilterDialog();
  const { universities, hasChosen } = usePreferences();
  const { theme, toggle } = useTheme();
  const visibleEvents = useVisibleEvents();
  const { status } = useAdmissions();

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <Link className="brand" to="/">
          2027 수시 일정<span className="brand__suffix">(GSHS)</span>
        </Link>

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
            className={`button button--pick ${hasChosen ? "" : "is-nudge"}`}
            onClick={openDialog}
          >
            <SlidersHorizontal size={16} aria-hidden="true" />내 대학 {universities.length}곳
          </button>
          <button
            type="button"
            className="button button--ghost app-header__export"
            onClick={() => downloadIcs(visibleEvents)}
            disabled={visibleEvents.length === 0}
            title="고른 대학 일정을 .ics 파일로 내려받습니다"
          >
            <CalendarPlus size={16} aria-hidden="true" />
            캘린더에 담기
          </button>
          <button
            type="button"
            className="button button--ghost app-header__print"
            onClick={() => window.print()}
            disabled={universities.length === 0 || status !== "ready"}
            title={`A4 인쇄 · ${PRINT_SCOPE}`}
            aria-label="선택 대학 A4 인쇄"
          >
            <Printer size={16} aria-hidden="true" /><span>인쇄</span>
          </button>
          <button
            type="button"
            className="icon-button"
            onClick={toggle}
            aria-label={theme === "dark" ? "밝은 화면으로" : "어두운 화면으로"}
            title={theme === "dark" ? "밝은 화면으로" : "어두운 화면으로"}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
}
