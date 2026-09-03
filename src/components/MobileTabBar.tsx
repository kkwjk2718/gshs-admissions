import { CalendarDays, ListChecks, Table2 } from "lucide-react";
import { NavLink } from "react-router-dom";

const TABS = [
  { to: "/", label: "남은 일정", icon: ListChecks, end: true },
  { to: "/calendar", label: "달력", icon: CalendarDays, end: false },
  { to: "/schedule", label: "전형표", icon: Table2, end: false },
];

/** 폰에서 화면 이동은 엄지가 닿는 아래쪽에 둔다. 라벨은 절대 숨기지 않는다. */
export function MobileTabBar() {
  return (
    <nav className="tab-bar" aria-label="화면 이동">
      {TABS.map(({ to, label, icon: Icon, end }) => (
        <NavLink key={to} to={to} end={end}>
          <Icon size={21} aria-hidden="true" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
