import { Check, ExternalLink, Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { ALL_CATEGORIES } from "../hooks/usePreferences";
import type { AdmissionCategory, AdmissionGuide } from "../types";
import { categoryClassName } from "./CategoryTag";

interface FilterPanelProps {
  universities: string[];
  selectedUniversities: string[];
  selectedCategories: AdmissionCategory[];
  guides: Record<string, AdmissionGuide>;
  onToggleUniversity: (university: string) => void;
  onSetUniversities: (universities: string[]) => void;
  onToggleCategory: (category: AdmissionCategory) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function FilterPanel({
  universities,
  selectedUniversities,
  selectedCategories,
  guides,
  onToggleUniversity,
  onSetUniversities,
  onToggleCategory,
  mobileOpen,
  onCloseMobile,
}: FilterPanelProps) {
  const [query, setQuery] = useState("");
  const visibleUniversities = useMemo(
    () => universities.filter((name) => name.toLocaleLowerCase("ko").includes(query.trim().toLocaleLowerCase("ko"))),
    [query, universities],
  );

  return (
    <>
      {mobileOpen && <button className="filter-backdrop" aria-label="필터 닫기" onClick={onCloseMobile} />}
      <aside className={`filter-panel ${mobileOpen ? "filter-panel--open" : ""}`} aria-label="일정 필터">
        <div className="panel-title-row">
          <div>
            <span className="eyebrow">FILTER</span>
            <h2>관심 대학</h2>
          </div>
          <button className="icon-button filter-close" onClick={onCloseMobile} aria-label="필터 닫기">
            <X size={19} />
          </button>
        </div>

        <label className="search-field">
          <Search size={16} aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="대학 검색"
            aria-label="대학 검색"
          />
        </label>

        <div className="filter-actions">
          <button onClick={() => onSetUniversities(universities)}>
            <Check size={14} /> 전체 선택
          </button>
          <button onClick={() => onSetUniversities([])}>전체 해제</button>
          <span>{selectedUniversities.length}/{universities.length}</span>
        </div>

        <div className="university-list">
          {visibleUniversities.map((university) => {
            const guide = guides[university];
            return (
              <div className="university-option" key={university}>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedUniversities.includes(university)}
                    onChange={() => onToggleUniversity(university)}
                  />
                  <span className="custom-checkbox" aria-hidden="true">
                    <Check size={12} />
                  </span>
                  <span>{university}</span>
                </label>
                {guide && (
                  <a
                    href={guide.url}
                    target="_blank"
                    rel="noreferrer"
                    title={`${university} ${guide.label}`}
                    aria-label={`${university} ${guide.label} 바로가기`}
                  >
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            );
          })}
        </div>

        <div className="filter-divider" />

        <div className="category-filter-title">
          <SlidersHorizontal size={15} />
          일정 종류
        </div>
        <div className="category-filter">
          {ALL_CATEGORIES.filter((category) => category !== "기타").map((category) => (
            <button
              key={category}
              className={`${categoryClassName(category)} ${selectedCategories.includes(category) ? "is-selected" : ""}`}
              onClick={() => onToggleCategory(category)}
              aria-pressed={selectedCategories.includes(category)}
            >
              <span />
              {category}
            </button>
          ))}
        </div>
      </aside>
    </>
  );
}

