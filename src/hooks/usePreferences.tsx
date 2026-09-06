import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { CATEGORY_ORDER, migrateCategorySelection } from "../lib/categories";
import { useAdmissions } from "./useAdmissions";
import type { CategoryId } from "../types";

const STORAGE_KEY = "gshs-admissions:preferences:v5";
const PREVIOUS_KEY = "gshs-admissions:preferences:v4";
const V3_KEY = "gshs-admissions:preferences:v3";
const LEGACY_KEY = "gshs-admissions:preferences:v2";

interface StoredPreferences {
  version: 5;
  universities: string[];
  categories: CategoryId[];
}

interface PreferencesValue {
  universities: string[];
  universitySet: Set<string>;
  categories: CategoryId[];
  categorySet: Set<CategoryId>;
  /** 대학이나 종류를 하나라도 빼놓은 상태인가 */
  isFiltered: boolean;
  /** 대학을 직접 고른 적이 있는가. 없으면 전체가 켜져 있고, 골라 보라고 권할 자리다. */
  hasChosen: boolean;
  toggleUniversity: (name: string) => void;
  setUniversities: (names: string[]) => void;
  toggleCategory: (id: CategoryId) => void;
  setCategories: (ids: CategoryId[]) => void;
  resetAll: () => void;
}

const PreferencesContext = createContext<PreferencesValue | null>(null);

/** v2는 카테고리를 한글 이름으로 저장했고 발표 3종을 "합격 발표" 하나로 뭉쳐뒀다. */
const LEGACY_CATEGORY_MAP: Record<string, CategoryId[]> = {
  "원서 접수": ["application"],
  "자소서 입력": ["essay"],
  "추천서 입력": ["recommendation"],
  "서류 제출": ["documents"],
  면접: ["interview"],
  "합격 발표": ["first-result", "final-result", "additional-result"],
};

function migrateLegacy(): StoredPreferences | null {
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { universities?: unknown; categories?: unknown };
    const universities = Array.isArray(parsed.universities)
      ? parsed.universities.filter((item): item is string => typeof item === "string")
      : [];
    const legacyCategories = Array.isArray(parsed.categories) ? parsed.categories : [];
    const categories = [
      ...new Set(
        legacyCategories.flatMap((item) => (typeof item === "string" ? (LEGACY_CATEGORY_MAP[item] ?? []) : [])),
      ),
    ];
    return {
      version: 5,
      universities,
      categories: categories.length ? migrateCategorySelection(categories) : [...CATEGORY_ORDER],
    };
  } catch {
    return null;
  }
}

function readStored(): StoredPreferences | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StoredPreferences | null;
      if (parsed?.version === 5 && Array.isArray(parsed.universities)) return parsed;
    }
    const previous = localStorage.getItem(PREVIOUS_KEY) ?? localStorage.getItem(V3_KEY);
    if (previous) {
      const parsed = JSON.parse(previous) as { version?: number; universities?: string[]; categories?: CategoryId[] };
      if ((parsed.version === 3 || parsed.version === 4) && Array.isArray(parsed.universities) && Array.isArray(parsed.categories)) {
        return { version: 5, universities: parsed.universities, categories: migrateCategorySelection(parsed.categories, parsed.version) };
      }
    }
  } catch {
    // 저장값이 깨졌으면 기본값으로 시작한다.
  }
  return migrateLegacy();
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const { universities: allUniversities } = useAdmissions();
  const [stored] = useState(readStored);
  // 명시적으로 전체 해제한 선택도 유지한다. 재접속·인쇄 때 전체 대학으로 바꾸지 않는다.
  const [hasChoice, setHasChoice] = useState(stored !== null);
  const [universities, setUniversitiesState] = useState<string[]>(stored?.universities ?? []);
  const [categories, setCategoriesState] = useState<CategoryId[]>(
    stored?.categories ?? [...CATEGORY_ORDER],
  );

  // 저장된 선택이 없으면 전체를 보여준다. 임의의 대학 4곳을 조용히 골라두면
  // 학생은 자기 대학이 빠진 화면을 "일정이 없다"로 읽는다.
  useEffect(() => {
    if (hasChoice || allUniversities.length === 0) return;
    setUniversitiesState(allUniversities);
  }, [allUniversities, hasChoice]);

  const persist = useCallback((next: { universities: string[]; categories: CategoryId[] }) => {
    setHasChoice(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 5, ...next } satisfies StoredPreferences));
      localStorage.removeItem(LEGACY_KEY);
      localStorage.removeItem(PREVIOUS_KEY);
    } catch {
      // 저장에 실패해도 이번 세션에서는 그대로 동작한다.
    }
  }, []);

  const setUniversities = useCallback(
    (names: string[]) => {
      setUniversitiesState(names);
      persist({ universities: names, categories });
    },
    [categories, persist],
  );

  const setCategories = useCallback(
    (ids: CategoryId[]) => {
      setCategoriesState(ids);
      persist({ universities, categories: ids });
    },
    [persist, universities],
  );

  const toggleUniversity = useCallback(
    (name: string) => {
      const next = universities.includes(name)
        ? universities.filter((item) => item !== name)
        : [...universities, name];
      setUniversities(next);
    },
    [setUniversities, universities],
  );

  const toggleCategory = useCallback(
    (id: CategoryId) => {
      const next = categories.includes(id)
        ? categories.filter((item) => item !== id)
        : CATEGORY_ORDER.filter((item) => item === id || categories.includes(item));
      setCategories(next);
    },
    [categories, setCategories],
  );

  const resetAll = useCallback(() => {
    setUniversitiesState(allUniversities);
    setCategoriesState([...CATEGORY_ORDER]);
    persist({ universities: allUniversities, categories: [...CATEGORY_ORDER] });
  }, [allUniversities, persist]);

  const value = useMemo<PreferencesValue>(
    () => ({
      universities,
      universitySet: new Set(universities),
      categories,
      categorySet: new Set(categories),
      isFiltered:
        (allUniversities.length > 0 && universities.length < allUniversities.length) ||
        categories.length < CATEGORY_ORDER.length,
      hasChosen: hasChoice,
      toggleUniversity,
      setUniversities,
      toggleCategory,
      setCategories,
      resetAll,
    }),
    [
      allUniversities.length,
      categories,
      hasChoice,
      resetAll,
      setCategories,
      setUniversities,
      toggleCategory,
      toggleUniversity,
      universities,
    ],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const value = useContext(PreferencesContext);
  if (!value) throw new Error("usePreferences must be used inside PreferencesProvider");
  return value;
}
