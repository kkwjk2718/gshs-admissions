import { SlidersHorizontal } from "lucide-react";
import { useAdmissions } from "../hooks/useAdmissions";
import { useFilterDialog } from "../hooks/useFilterDialog";
import { usePreferences } from "../hooks/usePreferences";

/**
 * 대학을 아직 고르지 않았으면 24곳이 전부 켜져 있다.
 * 그 상태에서 달력은 자기 일정 열 배를 보여주므로, 고르는 길을 먼저 내준다.
 */
export function PickUniversities() {
  const { status, universities: all } = useAdmissions();
  const { hasChosen } = usePreferences();
  const { openDialog } = useFilterDialog();

  if (status !== "ready" || hasChosen) return null;

  return (
    <section className="pick">
      <div className="pick__text">
        <h2>지원할 대학을 선택하세요</h2>
        <p>지금은 {all.length}곳이 모두 켜져 있어요. 선택하면 그 대학 일정만 보입니다.</p>
      </div>
      <button type="button" className="button button--primary" onClick={openDialog}>
        <SlidersHorizontal size={16} aria-hidden="true" />내 대학 선택
      </button>
    </section>
  );
}
