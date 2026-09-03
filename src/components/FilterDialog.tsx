import { Check, ExternalLink, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { admissionGuides } from "../data/admissionGuides";
import { useAdmissions } from "../hooks/useAdmissions";
import { usePreferences } from "../hooks/usePreferences";
import { CATEGORY_GROUPS, CATEGORY_ORDER, CATEGORY_UI, categoryClass } from "../lib/categories";
import type { AdmissionGuide } from "../types";

const guides = admissionGuides as Record<string, AdmissionGuide>;

interface FilterDialogProps {
  open: boolean;
  onClose: () => void;
}

export function FilterDialog({ open, onClose }: FilterDialogProps) {
  const { universities: allUniversities } = useAdmissions();
  const preferences = usePreferences();
  const ref = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const visible = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("ko");
    if (!needle) return allUniversities;
    return allUniversities.filter((name) => name.toLocaleLowerCase("ko").includes(needle));
  }, [allUniversities, query]);

  return (
    <dialog
      className="filter-dialog"
      ref={ref}
      onClose={onClose}
      onClick={(clickEvent) => {
        if (clickEvent.target === ref.current) onClose();
      }}
      aria-labelledby="filter-dialog-title"
    >
      <div className="filter-dialog__body">
        <header className="filter-dialog__head">
          <h2 id="filter-dialog-title">내 대학 선택</h2>
          <button type="button" className="icon-button" onClick={onClose} aria-label="닫기">
            <X size={20} />
          </button>
        </header>

        <div className="filter-dialog__scroll">
          <section className="filter-section">
            <div className="filter-section__head">
              <h3>대학</h3>
              <span className="filter-count">
                {preferences.universities.length}곳 / {allUniversities.length}곳
              </span>
            </div>

            <div className="preset-row">
              <button type="button" onClick={() => preferences.setUniversities(allUniversities)}>
                모두 선택
              </button>
              <button type="button" onClick={() => preferences.setUniversities([])}>
                모두 해제
              </button>
            </div>

            <label className="search-field">
              <Search size={18} aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(changeEvent) => setQuery(changeEvent.target.value)}
                placeholder="대학 검색"
                aria-label="대학 이름 검색"
              />
            </label>

            <ul className="university-list">
              {visible.map((name) => {
                const guide = guides[name];
                const checked = preferences.universitySet.has(name);
                return (
                  <li key={name}>
                    <label className="university-option">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => preferences.toggleUniversity(name)}
                      />
                      <span className="checkbox" aria-hidden="true">
                        <Check size={14} strokeWidth={3} />
                      </span>
                      <span className="university-option__name">{name}</span>
                    </label>
                    {guide && (
                      <a
                        className="icon-link"
                        href={guide.url}
                        target="_blank"
                        rel="noreferrer"
                        title={`${name} 모집요강 바로가기`}
                        aria-label={`${name} 모집요강 바로가기, 새 탭에서 열림`}
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}
                  </li>
                );
              })}
              {visible.length === 0 && <li className="university-list__empty">검색 결과 없음</li>}
            </ul>
          </section>

          <section className="filter-section">
            <div className="filter-section__head">
              <h3>일정 종류</h3>
              <span className="filter-count">
                {preferences.categories.length}종 / {CATEGORY_ORDER.length}종
              </span>
            </div>

            <div className="preset-row">
              <button type="button" onClick={() => preferences.setCategories([...CATEGORY_ORDER])}>
                모두 선택
              </button>
              <button type="button" onClick={() => preferences.setCategories([])}>
                모두 해제
              </button>
            </div>

            {CATEGORY_GROUPS.map((group) => (
              <div className="category-group" key={group.name}>
                <h4>{group.name}</h4>
                <div className="category-toggles">
                  {group.ids.map((id) => {
                    const meta = CATEGORY_UI[id];
                    const Icon = meta.icon;
                    const selected = preferences.categorySet.has(id);
                    return (
                      <button
                        type="button"
                        key={id}
                        className={`category-toggle ${categoryClass(id)} ${selected ? "is-selected" : ""}`}
                        aria-pressed={selected}
                        onClick={() => preferences.toggleCategory(id)}
                      >
                        <Icon size={16} aria-hidden="true" />
                        <span>{meta.label}</span>
                        {meta.hint && <em>{meta.hint}</em>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </section>
        </div>

        <footer className="filter-dialog__foot">
          <button type="button" className="button" onClick={preferences.resetAll}>
            처음 상태로
          </button>
          <button type="button" className="button button--primary" onClick={onClose}>
            {preferences.universities.length}곳 적용
          </button>
        </footer>
      </div>
    </dialog>
  );
}
