import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "gshs-admissions:theme";

function readStored(): Theme | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

function systemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/**
 * index.html 의 인라인 스크립트가 첫 페인트 전에 data-theme 을 이미 채워 둔다.
 * 여기서는 사용자의 선택을 기록하고, 선택이 없는 동안 기기 설정을 따라간다.
 */
export function useTheme() {
  const [chosen, setChosen] = useState<Theme | null>(readStored);
  const [theme, setTheme] = useState<Theme>(() => chosen ?? systemTheme());

  useEffect(() => {
    if (chosen) return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => setTheme(media.matches ? "dark" : "light");
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, [chosen]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((current) => {
      const next: Theme = current === "dark" ? "light" : "dark";
      setChosen(next);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // 저장이 안 돼도 이번 세션에서는 그대로 동작한다.
      }
      return next;
    });
  }, []);

  return { theme, toggle };
}
