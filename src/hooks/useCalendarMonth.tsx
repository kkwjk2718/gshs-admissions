import { createContext, useContext, useLayoutEffect, useState, type Dispatch, type SetStateAction, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { format } from "date-fns";
import { todayKey } from "../lib/date";

const KEY = "gshs-admissions:calendar-month:v1";
export function validCalendarDate(value: string | null): string | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T12:00:00`);
  return Number.isFinite(date.getTime()) && format(date, "yyyy-MM-dd") === value ? value : null;
}
function storedMonth() {
  try { return validCalendarDate(sessionStorage.getItem(KEY)); } catch { return null; }
}
const Context = createContext<{ month: Date; setMonth: Dispatch<SetStateAction<Date>>; monthSource: string } | null>(null);
export function CalendarMonthProvider({ children }: { children: ReactNode }) {
  const { pathname, search } = useLocation();
  const linkDate = pathname === "/" ? validCalendarDate(new URLSearchParams(search).get("d")) : null;
  const [initialStored] = useState(storedMonth);
  const [month, setMonth] = useState(() => new Date(`${linkDate ?? initialStored ?? todayKey()}T12:00:00`));
  const [visited, setVisited] = useState(pathname === "/" || initialStored !== null);
  // A deep link reached through client navigation must update the same state as the toolbar.
  useLayoutEffect(() => {
    if (pathname === "/") setVisited(true);
    if (linkDate) setMonth(new Date(`${linkDate}T12:00:00`));
  }, [pathname, linkDate]);
  useLayoutEffect(() => {
    try { sessionStorage.setItem(KEY, format(month, "yyyy-MM-01")); } catch { /* private mode */ }
  }, [month]);
  const monthSource = pathname === "/" ? "현재 표시 중인 월" : visited ? "마지막으로 본 달력 월" : "달력 방문 전 · 이번 달";
  return <Context.Provider value={{ month, setMonth, monthSource }}>{children}</Context.Provider>;
}
export function useCalendarMonth() {
  const value = useContext(Context);
  if (!value) throw new Error("useCalendarMonth requires CalendarMonthProvider");
  return value;
}
