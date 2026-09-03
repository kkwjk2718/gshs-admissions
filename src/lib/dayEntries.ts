import { CATEGORY_ORDER, CATEGORY_UI } from "./categories";
import type { AdmissionEvent, CategoryId } from "../types";

export type Phase = "end" | "start";

export interface TimeLine {
  /** "18:00" 또는 빈 문자열 */
  time: string;
  universities: string[];
  events: AdmissionEvent[];
  /** 그 대학이 이 줄에서 몇 건을 대표하는가. 2 이상이면 하나를 골라 열 수 없다. */
  counts: number[];
}

export interface DayEntry {
  id: string;
  categoryId: CategoryId;
  phase: Phase;
  /** "원서 마감" · "1차 발표" · "면접" · "원서 접수 시작" */
  label: string;
  /** 여러 종류를 "접수 시작" 한 줄로 묶었을 때 실제로 무엇이 열리는지 */
  kinds: string[];
  lines: TimeLine[];
  count: number;
}

/** 제출 계열. 같은 날 여러 개가 함께 열리면 종이 달력처럼 "접수 시작" 한 줄로 묶는다. */
const SUBMISSION: CategoryId[] = ["application", "essay", "recommendation", "documents"];

/** 시작 줄은 "추합 시작"처럼 토막 내지 않고 하는 일을 그대로 쓴다. */
const START_LABEL: Record<CategoryId, string> = {
  application: "원서 접수 시작",
  essay: "자소서 입력 시작",
  recommendation: "추천서 입력 시작",
  documents: "서류 제출 시작",
  "first-result": "1차 발표 시작",
  interview: "면접 시작",
  "final-result": "최종 발표 시작",
  "additional-result": "추합 발표 시작",
};

function endLabel(categoryId: CategoryId) {
  const meta = CATEGORY_UI[categoryId];
  return meta.noun === "면접" ? meta.short : `${meta.short} ${meta.noun}`;
}

function toLines(events: AdmissionEvent[], withTime: boolean): TimeLine[] {
  const byTime = new Map<string, TimeLine>();
  for (const event of events) {
    // 원문의 시각은 마감 시각이다. 시작일 칸에 붙이면 시작 시각처럼 읽힌다.
    const time = withTime ? (event.timeLabels[0] ?? "") : "";
    let line = byTime.get(time);
    if (!line) {
      line = { time, universities: [], events: [], counts: [] };
      byTime.set(time, line);
    }
    const index = line.universities.indexOf(event.university);
    if (index >= 0) {
      line.counts[index] += 1;
    } else {
      line.universities.push(event.university);
      line.events.push(event);
      line.counts.push(1);
    }
  }
  // 시각이 없는 줄은 맨 아래로 보낸다.
  return [...byTime.values()].sort(
    (a, b) => Number(!a.time) - Number(!b.time) || a.time.localeCompare(b.time),
  );
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
      kinds: [CATEGORY_UI[id].label],
      lines: toLines(list, true),
      count: list.length,
    };
  });

  const submissionStarts = starting.filter((event) => SUBMISSION.includes(event.categoryId));
  if (submissionStarts.length) {
    const ids = CATEGORY_ORDER.filter((id) => submissionStarts.some((event) => event.categoryId === id));
    entries.push({
      id: "start:submission",
      categoryId: ids[0],
      phase: "start",
      label: ids.length >= 2 ? "접수 시작" : START_LABEL[ids[0]],
      kinds: ids.map((item) => CATEGORY_UI[item].label),
      lines: toLines(submissionStarts, false),
      count: submissionStarts.length,
    });
  }

  // 면접·발표 기간은 제출과 성격이 달라 따로 둔다.
  for (const id of CATEGORY_ORDER) {
    if (SUBMISSION.includes(id)) continue;
    const list = starting.filter((event) => event.categoryId === id);
    if (!list.length) continue;
    entries.push({
      id: `start:${id}`,
      categoryId: id,
      phase: "start",
      label: START_LABEL[id],
      kinds: [CATEGORY_UI[id].label],
      lines: toLines(list, false),
      count: list.length,
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
