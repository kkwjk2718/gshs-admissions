import { CATEGORY_ORDER, CATEGORY_UI } from "./categories";
import type { AdmissionEvent, CategoryId } from "../types";

export type Phase = "end" | "start";

export interface TimeLine {
  /** "18:00" 또는 빈 문자열 */
  time: string;
  universities: string[];
  events: AdmissionEvent[];
}

export interface DayEntry {
  id: string;
  categoryId: CategoryId;
  phase: Phase;
  /** "원서 마감" · "1차 발표" · "면접" · "원서 시작" */
  label: string;
  lines: TimeLine[];
  count: number;
}

function endLabel(categoryId: CategoryId) {
  const meta = CATEGORY_UI[categoryId];
  return meta.noun === "면접" ? meta.short : `${meta.short} ${meta.noun}`;
}

/** 같은 날 여러 서류가 함께 열리면 종이 달력처럼 "접수 시작" 한 줄로 묶는다. */
function startLabel(categoryIds: CategoryId[]) {
  const shorts = CATEGORY_ORDER.filter((id) => categoryIds.includes(id)).map((id) => CATEGORY_UI[id].short);
  if (shorts.length >= 3) return "접수 시작";
  return `${shorts.join("·")} 시작`;
}

function toLines(events: AdmissionEvent[], withTime: boolean): TimeLine[] {
  const byTime = new Map<string, TimeLine>();
  for (const event of events) {
    // 원문의 시각은 마감 시각이다. 시작일 칸에 붙이면 시작 시각처럼 읽힌다.
    const time = withTime ? (event.timeLabels[0] ?? "") : "";
    const line = byTime.get(time);
    if (line) {
      if (!line.universities.includes(event.university)) {
        line.universities.push(event.university);
        line.events.push(event);
      }
    } else {
      byTime.set(time, { time, universities: [event.university], events: [event] });
    }
  }
  // 시각이 없는 줄은 맨 아래로 보낸다.
  return [...byTime.values()].sort((a, b) => (a.time || "~").localeCompare(b.time || "~"));
}

/**
 * 종이 달력과 같은 방식으로 하루치를 접는다.
 * 일정 하나에 칩 하나를 그리면 9월 11일 한 칸에 24개가 쌓인다.
 * 같은 종류를 한 줄로 묶고 대학을 시각별로 나열하면 같은 날이 네 줄로 끝난다.
 */
export function buildDayEntries(events: AdmissionEvent[], dateKey: string): DayEntry[] {
  const ending = new Map<CategoryId, AdmissionEvent[]>();
  const starting: AdmissionEvent[] = [];

  for (const event of events) {
    if (event.deadlineDate === dateKey) {
      const list = ending.get(event.categoryId);
      if (list) list.push(event);
      else ending.set(event.categoryId, [event]);
    } else if (event.isDateRange && event.startDate === dateKey) {
      starting.push(event);
    }
  }

  const entries: DayEntry[] = CATEGORY_ORDER.filter((id) => ending.has(id)).map((id) => {
    const list = ending.get(id) as AdmissionEvent[];
    return {
      id: `end:${id}`,
      categoryId: id,
      phase: "end",
      label: endLabel(id),
      lines: toLines(list, true),
      count: list.length,
    };
  });

  if (starting.length) {
    const categoryIds = [...new Set(starting.map((event) => event.categoryId))];
    entries.push({
      id: "start",
      categoryId: CATEGORY_ORDER.find((id) => categoryIds.includes(id)) as CategoryId,
      phase: "start",
      label: startLabel(categoryIds),
      lines: toLines(starting, false),
      count: starting.length,
    });
  }

  return entries;
}

/** 그 날 진행 중인(시작도 마감도 아닌) 일정 수 */
export function ongoingCountOn(events: AdmissionEvent[], dateKey: string) {
  return events.filter(
    (event) =>
      event.isDateRange &&
      event.startDate < dateKey &&
      dateKey < event.deadlineDate,
  ).length;
}
