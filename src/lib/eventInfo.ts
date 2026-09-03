import { CATEGORY_UI } from "./categories";
import { formatMonthDay, todayKey } from "./date";
import type { AdmissionEvent, CategoryId } from "../types";

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

/** 마감이 있는 종류. 발표·면접은 시각이 원문에 없는 게 정상이다. */
const DEADLINE_CATEGORIES: CategoryId[] = ["application", "essay", "recommendation", "documents"];

/** "9.10(목) 소인 유효"처럼 우편 마감일이 접수 마감일보다 늦게 따로 적힌 경우를 잡는다. */
function postmarkDate(raw: string) {
  return raw.match(/(\d{1,2})\.(\d{1,2})\s*\([월화수목금토일]\)[^가-힣]*소인/)?.slice(1, 3);
}

/**
 * 원문에만 적혀 있어 놓치기 쉬운 조건. 마감을 하루 착각하게 만드는 정보라
 * 회색 본문에 묻어두지 않고 배지로 올린다.
 */
export function eventBadges(event: AdmissionEvent): string[] {
  const badges: string[] = [];
  const raw = event.rawSchedule;

  const postmark = postmarkDate(raw);
  if (postmark) badges.push(`${Number(postmark[0])}월 ${Number(postmark[1])}일 소인까지 유효`);
  else if (/소인/.test(raw)) badges.push("우편 소인 유효");

  if (/온라인/i.test(raw)) badges.push("온라인 제출");
  if (/학교장\s*추천/.test(raw)) badges.push("학교장 추천");
  if (event.excludedDates.length) {
    badges.push(`${event.excludedDates.map(formatMonthDay).join("·")} 제외`);
  }
  // 발표에 시각이 없는 건 원본에서 정상이고 학생이 할 일도 없다.
  // 경고를 거기까지 붙이면 정작 "언제까지인지 모르는 마감" 6건이 묻힌다.
  if (!event.timeLabels.length && DEADLINE_CATEGORIES.includes(event.categoryId)) {
    badges.push("마감 시각 미표기");
  }

  return badges;
}

/** 위 배지들이 이미 설명한 낱말. 남은 텍스트를 셀 때 제외한다. */
const EXPLAINED_WORDS = /소인|유효|우편|온라인|스캔본|pdf|제외|학교장|추천|이전|까지/gi;

/**
 * 여러 날짜가 든 원문에서 날짜·시각·설명된 낱말을 걷어내고도 글자가 남으면,
 * 그 글자는 "논술", "반도체", "의대 / 사범" 처럼 어느 모집단위가 어느 날인지를 가르는 말이다.
 * 앱이 임의로 갈라 읽으면 틀린 날짜를 사실처럼 보여주게 되므로 경고만 붙이고 원문을 그대로 보여준다.
 * (차수만 나뉜 충원 발표처럼 이미 날짜별로 분리 저장된 건에는 붙지 않는다.)
 */
export function hasAmbiguousSchedule(event: AdmissionEvent) {
  const leftover = event.rawSchedule
    .replace(/(?:20\d{2}\.)?\d{1,2}\.\d{1,2}\.?/g, " ")
    .replace(/\([^)]*\)/g, " ")
    .replace(/\d{1,2}:\d{2}/g, " ")
    .replace(EXPLAINED_WORDS, " ")
    .replace(/[\d~\-–,.:·\s]+/g, " ")
    .trim();
  return leftover.length > 0;
}
