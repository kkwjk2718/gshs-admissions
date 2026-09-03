import { CalendarDays, ExternalLink, Table2 } from "lucide-react";
import { NavLink } from "react-router-dom";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <a className="brand" href="https://gshs.app" target="_blank" rel="noreferrer">
          <span className="brand__mark">G</span>
          <span className="brand__name">GSHS.app</span>
          <span className="brand__divider" aria-hidden="true" />
          <span className="brand__section">2027 입시 일정</span>
          <ExternalLink size={13} className="brand__external" aria-hidden="true" />
        </a>

        <nav className="primary-nav" aria-label="주요 메뉴">
          <NavLink to="/" end>
            <CalendarDays size={17} />
            일정
          </NavLink>
          <NavLink to="/schedule">
            <Table2 size={17} />
            전형일정표
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

