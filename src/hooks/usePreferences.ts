import { useEffect, useMemo, useState } from "react";
import type { AdmissionCategory } from "../types";

const STORAGE_KEY = "gshs-admissions:preferences:v2";
const DEFAULT_UNIVERSITIES = ["서울대", "KAIST", "POSTECH", "연세대"];

export const ALL_CATEGORIES: AdmissionCategory[] = [
  "원서 접수",
  "자소서 입력",
  "추천서 입력",
  "서류 제출",
  "면접",
  "합격 발표",
  "기타",
];

interface StoredPreferences {
  version: 2;
  universities: string[];
  categories: AdmissionCategory[];
}

function readStored(): StoredPreferences | null {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") as StoredPreferences | null;
    return parsed?.version === 2 ? parsed : null;
  } catch {
    return null;
  }
}

export function usePreferences(universities: string[]) {
  const [stored] = useState(readStored);
  const [selectedUniversities, setSelectedUniversities] = useState<string[]>(stored?.universities ?? []);
  const [selectedCategories, setSelectedCategories] = useState<AdmissionCategory[]>(
    stored?.categories?.length ? stored.categories : ALL_CATEGORIES,
  );
  const [initialized, setInitialized] = useState(Boolean(stored));

  useEffect(() => {
    if (initialized || universities.length === 0) return;
    const defaults = DEFAULT_UNIVERSITIES.filter((university) => universities.includes(university));
    setSelectedUniversities(defaults.length ? defaults : universities.slice(0, 4));
    setInitialized(true);
  }, [initialized, universities]);

  useEffect(() => {
    if (!initialized) return;
    const value: StoredPreferences = {
      version: 2,
      universities: selectedUniversities,
      categories: selectedCategories,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  }, [initialized, selectedCategories, selectedUniversities]);

  const selectedUniversitySet = useMemo(() => new Set(selectedUniversities), [selectedUniversities]);
  const selectedCategorySet = useMemo(() => new Set(selectedCategories), [selectedCategories]);

  const toggleUniversity = (university: string) => {
    setSelectedUniversities((current) =>
      current.includes(university) ? current.filter((item) => item !== university) : [...current, university],
    );
  };

  const toggleCategory = (category: AdmissionCategory) => {
    setSelectedCategories((current) =>
      current.includes(category) ? current.filter((item) => item !== category) : [...current, category],
    );
  };

  return {
    selectedUniversities,
    selectedUniversitySet,
    selectedCategories,
    selectedCategorySet,
    setSelectedUniversities,
    toggleUniversity,
    toggleCategory,
  };
}
