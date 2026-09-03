import { ArrowLeft, ArrowUpRight, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { admissionGuides } from "../data/admissionGuides";
import { scheduleTablePages } from "../data/scheduleTable";
import type { AdmissionGuide } from "../types";

interface SourceCell {
  text: string;
  rowSpan?: number;
}

interface SourceColumn {
  key: string;
  label: string;
}

interface SourceRow {
  id: string;
  university: string;
  cells: Record<string, SourceCell | null>;
}

interface SourcePage {
  page: number;
  columnKeys: string[];
  columns: SourceColumn[];
  rows: SourceRow[];
}

interface FlatRow {
  id: string;
  page: number;
  university: string;
  cells: Record<string, string>;
}

const pages = scheduleTablePages as unknown as SourcePage[];
const guides = admissionGuides as Record<string, AdmissionGuide>;

function flattenPages(sourcePages: SourcePage[]) {
  const result: FlatRow[] = [];

  for (const page of sourcePages) {
    const active: Record<string, { text: string; remaining: number }> = {};
    for (const row of page.rows) {
      const cells: Record<string, string> = {};
      for (const key of page.columnKeys) {
        const cell = row.cells[key];
        if (cell) {
          cells[key] = cell.text;
          active[key] = { text: cell.text, remaining: Math.max((cell.rowSpan || 1) - 1, 0) };
        } else if (active[key]?.remaining > 0) {
          cells[key] = active[key].text;
          active[key].remaining -= 1;
        } else {
          cells[key] = "";
        }
      }
      result.push({ id: row.id, page: page.page, university: row.university || cells.university, cells });
    }
  }
  return result;
}

export function SchedulePage() {
  const [query, setQuery] = useState("");
  const [university, setUniversity] = useState("전체 대학");
  const columns = pages[0]?.columns || [];
  const rows = useMemo(() => flattenPages(pages), []);
  const universities = useMemo(
    () => [...new Set(rows.map((row) => row.university).filter(Boolean))].sort((a, b) => a.localeCompare(b, "ko")),
    [rows],
  );
  const filteredRows = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("ko");
    return rows.filter((row) => {
      if (university !== "전체 대학" && row.university !== university) return false;
      if (!needle) return true;
      return Object.values(row.cells).some((value) => value.toLocaleLowerCase("ko").includes(needle));
    });
  }, [query, rows, university]);
  const mobileGroups = useMemo(() => {
    const grouped = new Map<string, FlatRow[]>();
    for (const row of filteredRows) {
      const key = row.university || "대학 미지정";
      grouped.set(key, [...(grouped.get(key) || []), row]);
    }
    return [...grouped.entries()];
  }, [filteredRows]);

  return (
    <main className="schedule-page">
      <div className="schedule-heading">
        <div>
          <Link to="/" className="back-link"><ArrowLeft size={15} /> 달력</Link>
          <h1>2027학년도 대입수시모집 전형일정</h1>
        </div>
        <span className="verify-badge">입학처 최종 확인 필수</span>
      </div>

      <div className="schedule-controls">
        <label className="search-field schedule-search">
          <Search size={16} />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="전형명, 일정 검색"
            aria-label="전형 일정 검색"
          />
        </label>
        <select value={university} onChange={(event) => setUniversity(event.target.value)} aria-label="대학 선택">
          <option>전체 대학</option>
          {universities.map((name) => <option key={name}>{name}</option>)}
        </select>
        <strong>{filteredRows.length}개 전형</strong>
      </div>

      <section className="schedule-table-card">
        <div className="schedule-table-scroll">
          <table className="schedule-table">
            <thead>
              <tr>
                {columns.map((column) => <th key={column.key}>{column.label}</th>)}
                <th>요강</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={row.id}>
                  {columns.map((column) => (
                    <td key={column.key} className={column.key === "university" ? "is-university" : ""}>
                      {row.cells[column.key]?.split("\n").map((line, index) => (
                        <span key={`${line}-${index}`}>{line}</span>
                      ))}
                    </td>
                  ))}
                  <td>
                    {guides[row.university] && (
                      <a href={guides[row.university].url} target="_blank" rel="noreferrer" className="table-guide-link" aria-label={`${row.university} 입시 요강`}>
                        <ArrowUpRight size={15} />
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="schedule-mobile-list">
          {mobileGroups.map(([name, groupRows], index) => (
            <details key={name} open={index === 0}>
              <summary>
                <span>{name}</span>
                <span>{groupRows.length}개 전형</span>
              </summary>
              <div className="mobile-row-list">
                {groupRows.map((row) => (
                  <article key={row.id}>
                    {columns.filter((column) => column.key !== "university" && row.cells[column.key]).map((column) => (
                      <div key={column.key}>
                        <dt>{column.label}</dt>
                        <dd>{row.cells[column.key]}</dd>
                      </div>
                    ))}
                    {guides[name] && (
                      <a className="guide-link" href={guides[name].url} target="_blank" rel="noreferrer">
                        입시 요강 <ArrowUpRight size={14} />
                      </a>
                    )}
                  </article>
                ))}
              </div>
            </details>
          ))}
        </div>

        {filteredRows.length === 0 && <div className="schedule-empty">검색 결과 없음</div>}
      </section>
    </main>
  );
}

