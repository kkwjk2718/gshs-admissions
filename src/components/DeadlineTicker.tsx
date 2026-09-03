import { Pause, Play } from "lucide-react";
import { useMemo, useState, type CSSProperties } from "react";
import { useAdmissions } from "../hooks/useAdmissions";
import { useVisibleEvents } from "../hooks/useVisibleEvents";
import { CATEGORY_UI, categoryClass } from "../lib/categories";
import { formatDday, todayKey, urgencyOf } from "../lib/date";
import type { AdmissionEvent } from "../types";

/** 마감이 가까운 순으로 이만큼만 돌린다. 24곳을 다 돌리면 한 바퀴가 너무 길다. */
const MAX_ITEMS = 12;
/** 한 바퀴 도는 데 걸리는 시간을 항목 수에 비례시켜 속도를 일정하게 둔다. */
const SECONDS_PER_ITEM = 3.4;
/** 한 바퀴가 화면 폭을 넘도록 채우는 최소 항목 수 */
const MIN_ITEMS = 8;

export function DeadlineTicker() {
  const { status } = useAdmissions();
  const events = useVisibleEvents();
  const [paused, setPaused] = useState(false);
  const today = todayKey();

  const items = useMemo(() => {
    const nearest = new Map<string, AdmissionEvent>();
    for (const event of events) {
      if (event.deadlineDate < today) continue;
      if (!nearest.has(event.university)) nearest.set(event.university, event);
    }
    return [...nearest.values()]
      .sort((a, b) => a.deadlineDate.localeCompare(b.deadlineDate))
      .slice(0, MAX_ITEMS);
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
    <div className={`ticker ${paused ? "is-paused" : ""}`}>
      {/* 속도는 커스텀 속성으로 넣는다. 인라인 animation-duration 은
          "동작 줄이기" 설정이 !important 로 덮어써 버린다. */}
      <div
        className="ticker__track"
        style={{ "--ticker-duration": `${filled.length * SECONDS_PER_ITEM}s` } as CSSProperties}
      >
        {row(0)}
        {row(1)}
      </div>
      {/* 저절로 움직이는 것은 멈출 수단이 있어야 한다 (WCAG 2.2.2). */}
      <button
        type="button"
        className="ticker__toggle"
        onClick={() => setPaused((value) => !value)}
        aria-label={paused ? "마감 띠 다시 움직이기" : "마감 띠 멈추기"}
        title={paused ? "다시 움직이기" : "멈추기"}
      >
        {paused ? <Play size={13} /> : <Pause size={13} />}
      </button>
    </div>
  );
}
