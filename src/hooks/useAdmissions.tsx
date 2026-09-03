import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { CATEGORY_ORDER } from "../lib/categories";
import type { AdmissionEvent, AdmissionsDataset, CategoryId } from "../types";

const DATA_URL = "/data/admissions.json";
const CACHE_KEY = "gshs-admissions:dataset:v1";

interface CacheEntry {
  savedAt: string;
  dataset: AdmissionsDataset;
}

type Status = "loading" | "ready" | "error";

interface AdmissionsValue {
  status: Status;
  dataset: AdmissionsDataset | null;
  events: AdmissionEvent[];
  universities: string[];
  /** 네트워크가 안 될 때 마지막으로 받아둔 자료를 보여주고 있는가 */
  offlineSavedAt: string | null;
  reload: () => void;
}

const AdmissionsContext = createContext<AdmissionsValue | null>(null);

function readCache(): CacheEntry | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as CacheEntry) : null;
  } catch {
    return null;
  }
}

function writeCache(dataset: AdmissionsDataset) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: new Date().toISOString(), dataset }));
  } catch {
    // 저장 공간이 없어도 앱 동작에는 지장이 없다.
  }
}

const CATEGORY_RANK = new Map<CategoryId, number>(CATEGORY_ORDER.map((id, index) => [id, index]));

function sortEvents(events: AdmissionEvent[]) {
  return [...events].sort(
    (a, b) =>
      a.deadlineDate.localeCompare(b.deadlineDate) ||
      a.startDate.localeCompare(b.startDate) ||
      (CATEGORY_RANK.get(a.categoryId) ?? 99) - (CATEGORY_RANK.get(b.categoryId) ?? 99) ||
      a.university.localeCompare(b.university, "ko"),
  );
}

export function AdmissionsProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>("loading");
  const [dataset, setDataset] = useState<AdmissionsDataset | null>(null);
  const [offlineSavedAt, setOfflineSavedAt] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");

    fetch(DATA_URL, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`${response.status}`);
        return response.json() as Promise<AdmissionsDataset>;
      })
      .then((json) => {
        if (!Array.isArray(json?.events)) throw new Error("unexpected shape");
        setDataset(json);
        setOfflineSavedAt(null);
        setStatus("ready");
        writeCache(json);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        const cached = readCache();
        if (cached) {
          setDataset(cached.dataset);
          setOfflineSavedAt(cached.savedAt);
          setStatus("ready");
        } else {
          setStatus("error");
        }
      });

    return () => controller.abort();
  }, [attempt]);

  const reload = useCallback(() => setAttempt((value) => value + 1), []);

  const value = useMemo<AdmissionsValue>(() => {
    const events = dataset ? sortEvents(dataset.events) : [];
    return {
      status,
      dataset,
      events,
      universities: dataset ? dataset.universities.map((item) => item.name) : [],
      offlineSavedAt,
      reload,
    };
  }, [dataset, offlineSavedAt, reload, status]);

  return <AdmissionsContext.Provider value={value}>{children}</AdmissionsContext.Provider>;
}

export function useAdmissions() {
  const value = useContext(AdmissionsContext);
  if (!value) throw new Error("useAdmissions must be used inside AdmissionsProvider");
  return value;
}
