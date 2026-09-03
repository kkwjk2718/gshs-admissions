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

export const fromDateKey = (value: string) => parseISO(value);

export function getCalendarDays(month: Date) {
  const first = startOfWeek(startOfMonth(month), { weekStartsOn: 0 });
  const last = endOfMonth(month);
  const days: Date[] = [];
  let cursor = first;

  while (days.length < 42 || cursor <= last) {
    days.push(cursor);
    cursor = addDays(cursor, 1);
  }

  return days;
}

export function formatEventRange(startDate: string, endDate: string) {
  const start = fromDateKey(startDate);
  const end = fromDateKey(endDate);

  if (isSameDay(start, end)) {
    return format(start, "M월 d일 (EEE)", { locale: ko });
  }

  if (isSameMonth(start, end)) {
    return `${format(start, "M월 d일", { locale: ko })} - ${format(end, "d일 (EEE)", { locale: ko })}`;
  }

  return `${format(start, "M월 d일", { locale: ko })} - ${format(end, "M월 d일 (EEE)", { locale: ko })}`;
}

export function formatDday(targetDate: string, today = new Date()) {
  const distance = differenceInCalendarDays(fromDateKey(targetDate), today);
  if (distance === 0) return "D-DAY";
  if (distance > 0) return `D-${distance}`;
  return `D+${Math.abs(distance)}`;
}

export function isDateInRange(date: string, startDate: string, endDate: string) {
  return date >= startDate && date <= endDate;
}

