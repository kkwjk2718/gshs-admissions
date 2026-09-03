import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { EventRow } from "../components/EventRow";
import { EventDetailDialog } from "../components/EventDetailDialog";
import { SiteFooter } from "../components/SiteFooter";
import { EmptySelection, ErrorState, LoadingState, OfflineBanner } from "../components/StateNotices";
import { useAdmissions } from "../hooks/useAdmissions";
import { useFilterDialog } from "../hooks/useFilterDialog";
import { usePreferences } from "../hooks/usePreferences";
import { useDeadlineGroups, useOngoingCount, useVisibleEvents } from "../hooks/useVisibleEvents";
import { CATEGORY_UI } from "../lib/categories";
import { formatDayLabel, formatDday, formatRelativeDay, daysUntil, todayKey, urgencyOf } from "../lib/date";
import type { AdmissionEvent } from "../types";

const GROUPS_PER_PAGE = 8;

export function DeadlinesPage() {
  const { status, events } = useAdmissions();
  const { universities, categories } = usePreferences();
  const { openDialog } = useFilterDialog();
  const visibleEvents = useVisibleEvents();
  const today = todayKey();
  const [query, setQuery] = useState("");
  const [shownGroups, setShownGroups] = useState(GROUPS_PER_PAGE);
  const [selected, setSelected] = useState<AdmissionEvent | null>(null);

  const searching = query.trim().length > 0;

  // 검색 중에는 고른 대학·종류를 무시하고 전체에서 찾는다.
  // 필터에 가려 "없다"고 결론 내리는 사고를 막는 쪽이 낫다.
  const listedEvents = useMemo(() => {
    if (!searching) return visibleEvents;
    const words = query.trim().toLocaleLowerCase("ko").split(/\s+/);
    return events.filter((event) => {
      const haystack = [
        event.university,
        CATEGORY_UI[event.categoryId].label,
        CATEGORY_UI[event.categoryId].short,
        event.admissionDetail,
        event.rawSchedule,
        formatDayLabel(event.deadlineDate),
      ]
        .join(" ")
        .toLocaleLowerCase("ko");
      return words.every((word) => haystack.includes(word));
    });
  }, [events, query, searching, visibleEvents]);

  const groups = useDeadlineGroups(listedEvents, today);
  const ongoing = useOngoingCount(listedEvents, today);

  const remaining = groups.reduce((count, group) => count + group.events.length, 0);
  const first = groups[0];

  /**
   * 배너는 그 날 전체를 대표해야 한다. 시각이 섞여 있으면(52개 마감일 중 13일이 그렇다)
   * 대표값을 하나 뽑는 순간 나머지 대학의 마감을 늦게 알려주게 되므로 시각을 빼고,
   * "마감"인지 "발표"인지도 그룹이 한 종류일 때만 단정한다.
   */
  const headline = useMemo(() => {
    if (!first) return null;
    const times = [...new Set(first.events.map((event) => event.timeLabels[0]).filter(Boolean))];
    const nouns = new Set(first.events.map((event) => CATEGORY_UI[event.categoryId].noun));
    return {
      noun: nouns.size === 1 ? [...nouns][0] : "일정",
      time: times.length === 1 ? times[0] : "",
      mixed: times.length > 1,
    };
  }, [first]);

  /** 대학마다 가장 가까운 마감 하나. 전형별로 다른 일정을 합치지 않는다. */
  const nextByUniversity = useMemo(() => {
    const map = new Map<string, AdmissionEvent>();
    for (const group of groups) {
      for (const event of group.events) {
        if (!map.has(event.university)) map.set(event.university, event);
      }
    }
    return [...map.values()].sort((a, b) => a.deadlineDate.localeCompare(b.deadlineDate));
  }, [groups]);

  if (status === "loading") {
    return (
      <main className="page page--deadlines">
        <LoadingState />
      </main>
    );
  }
  if (status === "error") {
    return (
      <main className="page page--deadlines">
        <ErrorState />
      </main>
    );
  }

  return (
    <main className="page page--deadlines">
      <OfflineBanner />

      <div className="page__head">
        <h1>남은 일정</h1>
        <p className="page__meta">
          {searching ? (
            <>전체 대학에서 찾은 결과 {remaining}건 · 마감일 {groups.length}일</>
          ) : (
            <>
              내 대학 {universities.length}곳 · 남은 일정 {remaining}건 · 마감일 {groups.length}일
              <button type="button" className="link-button" onClick={openDialog}>
                대학 바꾸기
              </button>
            </>
          )}
        </p>
      </div>

      <label className="search-field page__search">
        <Search size={18} aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(changeEvent) => {
            setQuery(changeEvent.target.value);
            setShownGroups(GROUPS_PER_PAGE);
          }}
          placeholder="대학, 전형, 일정 종류 검색"
          aria-label="일정 검색"
        />
      </label>

      {searching && groups.length === 0 ? (
        <div className="state-block">
          <p>‘{query.trim()}’와 맞는 남은 일정이 없어요.</p>
          <div className="state-block__actions">
            <button type="button" className="button button--primary" onClick={() => setQuery("")}>
              검색어 지우기
            </button>
          </div>
        </div>
      ) : !searching && (universities.length === 0 || categories.length === 0) ? (
        <EmptySelection />
      ) : groups.length === 0 ? (
        <div className="state-block">
          <p>남은 일정이 없어요. 고른 대학의 2027학년도 수시 일정이 모두 끝났어요.</p>
        </div>
      ) : (
        <div className="deadlines-layout">
          <div className="deadlines-main">
            {!searching && first && headline && daysUntil(first.date, today) <= 7 && (
              <div className={`highlight highlight--${urgencyOf(first.date, today)}`}>
                <p className="highlight__title">
                  가장 가까운 {headline.noun} — {formatDayLabel(first.date)}
                  {headline.time && ` ${headline.time}`}
                </p>
                <p className="highlight__body">
                  {formatRelativeDay(first.date, today)} · {first.events.length}건
                  {headline.mixed && " · 대학마다 시각이 달라요"}
                  {ongoing > 0 && ` · 지금 진행 중인 일정 ${ongoing}건`}
                </p>
              </div>
            )}

            {groups.slice(0, shownGroups).map((group) => (
              <section className="deadline-group" key={group.date}>
                <h2 className="deadline-group__head">
                  <span className="deadline-group__date">{formatDayLabel(group.date)}</span>
                  <span className={`dday dday--${urgencyOf(group.date, today)}`}>
                    {formatRelativeDay(group.date, today)}
                  </span>
                </h2>
                <div className="deadline-group__list">
                  {group.events.map((event) => (
                    <EventRow key={event.id} event={event} onSelect={setSelected} today={today} />
                  ))}
                </div>
              </section>
            ))}

            {shownGroups < groups.length && (
              <button
                type="button"
                className="button button--wide"
                onClick={() => setShownGroups((value) => value + GROUPS_PER_PAGE)}
              >
                마감일 {groups.length - shownGroups}일치 더 보기
              </button>
            )}
          </div>

          <aside className="deadlines-side" aria-label="대학별 다음 마감">
            <h2>대학별 다음 마감</h2>
            <ul className="next-list">
              {nextByUniversity.map((event) => (
                <li key={event.university}>
                  <button type="button" onClick={() => setSelected(event)}>
                    <span className="next-list__name">{event.university}</span>
                    <span className="next-list__what">{CATEGORY_UI[event.categoryId].short}</span>
                    <span className={`dday dday--${urgencyOf(event.deadlineDate, today)}`}>
                      {formatDday(event.deadlineDate, CATEGORY_UI[event.categoryId].noun, today)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      )}

      <SiteFooter />
      <EventDetailDialog event={selected} onClose={() => setSelected(null)} />
    </main>
  );
}
