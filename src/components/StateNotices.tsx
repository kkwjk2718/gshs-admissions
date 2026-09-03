import { CircleAlert, Info, RefreshCw } from "lucide-react";
import { useAdmissions } from "../hooks/useAdmissions";
import { useFilterDialog } from "../hooks/useFilterDialog";
import { usePreferences } from "../hooks/usePreferences";
import { formatDotted } from "../lib/date";

export function LoadingState() {
  return (
    <div className="state-block" role="status">
      <span className="spinner" aria-hidden="true" />
      일정을 불러오고 있어요
    </div>
  );
}

export function ErrorState() {
  const { reload } = useAdmissions();
  return (
    <div className="state-block state-block--error" role="alert">
      <CircleAlert size={22} aria-hidden="true" />
      <p>일정을 불러오지 못했어요. 인터넷 연결을 확인해 주세요.</p>
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
      지금은 인터넷에 연결되지 않아 {formatDotted(offlineSavedAt.slice(0, 10))} 저장해 둔 자료를 보여주고 있어요.
    </p>
  );
}

/** 대학이나 종류를 전부 꺼놓으면 "일정이 없다"로 오해하기 쉽다. 원인과 되돌리는 길을 함께 준다. */
export function EmptySelection() {
  const { universities: allUniversities } = useAdmissions();
  const { universities, categories, resetAll } = usePreferences();
  const { openDialog } = useFilterDialog();
  const reason = universities.length === 0 ? "대학" : categories.length === 0 ? "일정 종류" : null;
  if (!reason) return null;

  return (
    <div className="state-block">
      <p>고른 {reason}이 없어서 보여줄 일정이 없어요.</p>
      <div className="state-block__actions">
        <button type="button" className="button button--primary" onClick={resetAll}>
          전체 {allUniversities.length}곳 보기
        </button>
        <button type="button" className="button" onClick={openDialog}>
          내 대학 고르기
        </button>
      </div>
    </div>
  );
}
