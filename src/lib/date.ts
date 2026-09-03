import {
  addDays,
  differenceInCalendarDays,
  endOfMonth,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ko } from "date-fns/locale";

export const toDateKey = (date: Date) => format(date, "yyyy-MM-dd");

export const fromDateKey = (key: string) => parseISO(key);

export const todayKey = () => toDateKey(new Date());

export const isDateInRange = (key: string, startDate: string, endDate: string) =>
  key >= startDate && key <= endDate;

/**
 * 그 달을 덮는 주만 만든다. 6주를 항상 채우던 예전 방식은 대부분의 달에서
 * 빈 줄 하나를 그려 셀 높이를 깎았다.
 */
export function getCalendarWeeks(month: Date): Date[][] {
  const first = startOfWeek(startOfMonth(month), { weekStartsOn: 0 });
  const last = endOfMonth(month);
  const weeks: Date[][] = [];
  let cursor = first;

  while (cursor <= last) {
    weeks.push(Array.from({ length: 7 }, (_, index) => addDays(cursor, index)));
    cursor = addDays(cursor, 7);
  }

  return weeks;
}

/** "9월 9일 (수)" */
export function formatDayLabel(key: string) {
  return format(fromDateKey(key), "M월 d일 (EEE)", { locale: ko });
}

/** "9월 9일" */
export function formatMonthDay(key: string) {
  return format(fromDateKey(key), "M월 d일", { locale: ko });
}

/** "2026. 9. 3." */
export function formatDotted(key: string) {
  return format(fromDateKey(key), "yyyy. M. d.");
}

/**
 * 하루짜리면 "9월 9일(수)", 같은 달이면 "9월 1일(화)~9일(수)",
 * 달을 넘기면 "12월 23일(수)~1월 15일(금)".
 */
export function formatRange(startDate: string, endDate: string) {
  const start = fromDateKey(startDate);
  const end = fromDateKey(endDate);

  if (isSameDay(start, end)) return format(start, "M월 d일(EEE)", { locale: ko });
  if (isSameMonth(start, end)) {
    return `${format(start, "M월 d일(EEE)", { locale: ko })}~${format(end, "d일(EEE)", { locale: ko })}`;
  }
  return `${format(start, "M월 d일(EEE)", { locale: ko })}~${format(end, "M월 d일(EEE)", { locale: ko })}`;
}

export function daysUntil(key: string, today = todayKey()) {
  return differenceInCalendarDays(fromDateKey(key), fromDateKey(today));
}

export type Urgency = "past" | "today" | "soon" | "near" | "far";

export function urgencyOf(key: string, today = todayKey()): Urgency {
  const days = daysUntil(key, today);
  if (days < 0) return "past";
  if (days === 0) return "today";
  if (days <= 3) return "soon";
  if (days <= 7) return "near";
  return "far";
}

/** 목록 항목에 붙는 짧은 표기. "마감 D-6" / "내일 마감" / "오늘 마감" */
export function formatDday(key: string, noun: string, today = todayKey()) {
  const days = daysUntil(key, today);
  if (days < 0) return `${noun} 지남`;
  if (days === 0) return `오늘 ${noun}`;
  if (days === 1) return `내일 ${noun}`;
  return `${noun} D-${days}`;
}

/** 날짜 그룹 헤더 우측. "오늘" / "내일" / "6일 뒤" */
export function formatRelativeDay(key: string, today = todayKey()) {
  const days = daysUntil(key, today);
  if (days < 0) return `${Math.abs(days)}일 지남`;
  if (days === 0) return "오늘";
  if (days === 1) return "내일";
  return `${days}일 뒤`;
}
