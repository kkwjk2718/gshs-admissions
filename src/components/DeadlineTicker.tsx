import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useAdmissions } from "../hooks/useAdmissions";
import { useVisibleEvents } from "../hooks/useVisibleEvents";
import { CATEGORY_UI, categoryClass } from "../lib/categories";
import { formatDday, todayKey, urgencyOf } from "../lib/date";
import type { AdmissionEvent } from "../types";

/** 한 바퀴 도는 데 걸리는 시간을 항목 수에 비례시켜 속도를 일정하게 둔다. */
const SECONDS_PER_ITEM = 3.4;
/** 한 바퀴가 화면 폭을 넘도록 채우는 최소 항목 수 */
const MIN_ITEMS = 10;

export function DeadlineTicker() {
  const { status } = useAdmissions();
  const events = useVisibleEvents();
  const today = todayKey();

  const items = useMemo(() => {
    const nearest = new Map<string, AdmissionEvent>();
    for (const event of events) {
      if (event.deadlineDate < today) continue;
      if (!nearest.has(event.university)) nearest.set(event.university, event);
    }
    return [...nearest.values()].sort((a, b) => a.deadlineDate.localeCompare(b.deadlineDate));
  }, [events, today]);

  if (status !== "ready" || items.length === 0) return null;

  // 고른 대학이 두어 곳뿐이면 한 바퀴가 화면보다 짧아 빈 자리가 생긴다. 채워서 돌린다.
  const filled =
    items.length >= MIN_ITEMS
      ? items
      : Array.from({ length: Math.ceil(MIN_ITEMS / items.length) }, () => items).flat();

  const row = (copy: number) => (
    <div className="ticker__row" key={copy} aria-hidden={copy > 0}>
      {filled.map((event, index) => {
        const meta = CATEGORY_UI[event.categoryId];
        return (
          <span className="ticker__item" key={`${event.id}-${index}`}>
            <span className={`ticker__dot ${categoryClass(event.categoryId)}`} aria-hidden="true" />
            <b>{event.university}</b>
            <span className="ticker__what">{meta.short}</span>
            <strong className={`ticker__dday dday--${urgencyOf(event.deadlineDate, today)}`}>
              {formatDday(event.deadlineDate, meta.noun, today)}
            </strong>
          </span>
        );
      })}
    </div>
  );

  return (
    <Link className="ticker" to="/deadlines" aria-label={`남은 일정 ${items.length}개 대학, 전체 보기`}>
      <div className="ticker__track" style={{ animationDuration: `${filled.length * SECONDS_PER_ITEM}s` }}>
        {row(0)}
        {row(1)}
      </div>
    </Link>
  );
}
