import { CATEGORY_UI } from "./categories";
import { formatMonthDay, todayKey } from "./date";
import type { AdmissionEvent } from "../types";

export type EventStatus = "due-today" | "ongoing" | "upcoming" | "past";

export function statusOf(event: AdmissionEvent, today = todayKey()): EventStatus {
  if (event.deadlineDate < today) return "past";
  if (event.deadlineDate === today) return "due-today";
  if (event.isDateRange && event.startDate <= today) return "ongoing";
  return "upcoming";
}

const ONGOING_LABEL: Record<string, string> = {
  application: "접수 중",
  essay: "입력 중",
  recommendation: "입력 중",
  documents: "제출 중",
};

export function statusLabel(event: AdmissionEvent, today = todayKey()) {
  const status = statusOf(event, today);
  if (status === "due-today") return `오늘 ${CATEGORY_UI[event.categoryId].noun}`;
  if (status === "ongoing") return ONGOING_LABEL[event.categoryId] ?? "진행 중";
  return null;
}

/** "18:00 마감" / "10:00 발표". 시각이 없으면 null. */
export function deadlineTimeLabel(event: AdmissionEvent) {
  const time = event.timeLabels[0];
  if (!time) return null;
  return `${time} ${CATEGORY_UI[event.categoryId].noun}`;
}

/**
 * 원문에만 적혀 있어 놓치기 쉬운 조건. 마감을 하루 착각하게 만드는 정보라
 * 회색 본문에 묻어두지 않고 배지로 올린다.
 */
export function eventBadges(event: AdmissionEvent): string[] {
  const badges: string[] = [];
  const raw = event.rawSchedule;

  if (/소인/.test(raw)) badges.push("우편 소인 유효");
  if (/온라인/i.test(raw)) badges.push("온라인 제출");
  if (/학교장\s*추천/.test(raw)) badges.push("학교장 추천");
  if (event.excludedDates.length) {
    badges.push(`${event.excludedDates.map(formatMonthDay).join("·")} 제외`);
  }
  if (!event.timeLabels.length && CATEGORY_UI[event.categoryId].noun !== "면접") {
    badges.push("시각 미표기");
  }

  return badges;
}

/**
 * 면접 원문 일부는 모집단위마다 날짜가 달라 한 문자열에 여러 날짜가 들어 있다.
 * 앱이 임의로 갈라 읽으면 틀린 날짜를 사실처럼 보여주게 되므로 경고만 붙인다.
 */
export function hasAmbiguousSchedule(event: AdmissionEvent) {
  const dates = event.rawSchedule.match(/\d{1,2}\.\d{1,2}/g);
  if (!dates) return false;
  const expected = event.isDateRange ? 2 : 1;
  return dates.length > expected;
}
