import { CircleAlert, Info, RefreshCw } from "lucide-react";
import { useAdmissions } from "../hooks/useAdmissions";
import { useFilterDialog } from "../hooks/useFilterDialog";
import { usePreferences } from "../hooks/usePreferences";
import { CATEGORY_ORDER } from "../lib/categories";
import { formatDotted } from "../lib/date";

export function LoadingState() {
  return (
    <div className="state-block" role="status">
      <span className="spinner" aria-hidden="true" />
      불러오는 중
    </div>
  );
}

export function ErrorState() {
  const { reload } = useAdmissions();
  return (
    <div className="state-block state-block--error" role="alert">
      <CircleAlert size={22} aria-hidden="true" />
      <p>일정을 불러오지 못했습니다. 연결을 확인하세요.</p>
      <button type="button" className="button button--primary" onClick={reload}>
        <RefreshCw size={16} aria-hidden="true" />
        다시 시도
      </button>
    </div>
  );
}

export function OfflineBanner() {
  const { offlineSavedAt } = useAdmissions();
  if (!offlineSavedAt) return null;
  return (
    <p className="notice notice--warn" role="status">
      <Info size={16} aria-hidden="true" />
      오프라인 · {formatDotted(offlineSavedAt.slice(0, 10))}에 저장한 자료
    </p>
  );
}

/** 대학이나 종류를 전부 꺼놓으면 "일정이 없다"로 오해하기 쉽다. 원인과 되돌리는 길을 함께 준다. */
export function EmptySelection() {
  const { universities: allUniversities } = useAdmissions();
  const { universities, categories, setCategories, resetAll } = usePreferences();
  const { openDialog } = useFilterDialog();

  if (universities.length > 0 && categories.length > 0) return null;
  const noUniversity = universities.length === 0;

  return (
    <div className="state-block">
      <p>
        {noUniversity
          ? "선택한 대학 없음"
          : "일정 종류가 모두 꺼져 있음"}
      </p>
      <div className="state-block__actions">
        {noUniversity ? (
          <button type="button" className="button button--primary" onClick={resetAll}>
            전체 {allUniversities.length}곳 보기
          </button>
        ) : (
          <button
            type="button"
            className="button button--primary"
            onClick={() => setCategories([...CATEGORY_ORDER])}
          >
            일정 종류 {CATEGORY_ORDER.length}종 모두 켜기
          </button>
        )}
        <button type="button" className="button" onClick={openDialog}>
          {noUniversity ? "내 대학 고르기" : "일정 종류 고르기"}
        </button>
      </div>
    </div>
  );
}
