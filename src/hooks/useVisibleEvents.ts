import { useMemo } from "react";
import { todayKey } from "../lib/date";
import { useAdmissions } from "./useAdmissions";
import { usePreferences } from "./usePreferences";
import type { AdmissionEvent } from "../types";

export interface DeadlineGroup {
  date: string;
  events: AdmissionEvent[];
}

export function useVisibleEvents() {
  const { events } = useAdmissions();
  const { universitySet, categorySet } = usePreferences();

  return useMemo(
    () => events.filter((event) => universitySet.has(event.university) && categorySet.has(event.categoryId)),
    [categorySet, events, universitySet],
  );
}

/**
 * 마감일이 오늘 이후인 일정을 마감일로 묶는다.
 * 진행 중인 일정도 포함해야 한다 — 마감이 가장 가까운 것이 바로 그것들이다.
 */
export function useDeadlineGroups(events: AdmissionEvent[], today = todayKey()) {
  return useMemo(() => {
    const groups = new Map<string, AdmissionEvent[]>();
    for (const event of events) {
      if (event.deadlineDate < today) continue;
      const list = groups.get(event.deadlineDate);
      if (list) list.push(event);
      else groups.set(event.deadlineDate, [event]);
    }
    return [...groups.entries()]
      .map(([date, list]) => ({ date, events: list }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [events, today]);
}

export function useOngoingCount(events: AdmissionEvent[], today = todayKey()) {
  return useMemo(
    () => events.filter((event) => event.isDateRange && event.startDate <= today && today <= event.deadlineDate).length,
    [events, today],
  );
}
