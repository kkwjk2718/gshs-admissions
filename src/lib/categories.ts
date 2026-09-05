import {
  FileText,
  FolderUp,
  ListChecks,
  MessageSquare,
  PenLine,
  Trophy,
  UserCheck,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import type { CategoryId } from "../types";

export type CategoryGroup = "제출" | "평가" | "발표" | "등록";

interface CategoryUi {
  /** 필터·상세용 정식 라벨 */
  label: string;
  /** 달력 칩처럼 좁은 자리용 */
  short: string;
  /** 필터에서 헷갈리기 쉬운 이름에만 붙이는 보조 설명 */
  hint?: string;
  group: CategoryGroup;
  icon: LucideIcon;
  /** D-day에 붙는 명사. "마감 D-6" / "발표 D-12" / "면접 D-3" */
  noun: "마감" | "발표" | "면접";
}

/** 원본 PDF 순서에 모집요강으로 확인한 등록 일정을 덧붙인다. */
export const CATEGORY_ORDER: CategoryId[] = [
  "application",
  "essay",
  "recommendation",
  "documents",
  "first-result",
  "interview",
  "final-result",
  "additional-result",
  "registration",
];

export const CATEGORY_UI: Record<CategoryId, CategoryUi> = {
  registration: { label: "합격자 등록", short: "등록", group: "등록", icon: UserCheck, noun: "마감" },
  application: { label: "원서 접수", short: "원서", group: "제출", icon: FileText, noun: "마감" },
  essay: { label: "자소서 입력", short: "자소서", group: "제출", icon: PenLine, noun: "마감" },
  recommendation: { label: "추천서 입력", short: "추천서", group: "제출", icon: UserCheck, noun: "마감" },
  documents: { label: "서류 제출", short: "서류", group: "제출", icon: FolderUp, noun: "마감" },
  "first-result": { label: "1차 합격 발표", short: "1차", group: "발표", icon: ListChecks, noun: "발표" },
  interview: { label: "면접", short: "면접", group: "평가", icon: MessageSquare, noun: "면접" },
  "final-result": { label: "최종 합격 발표", short: "최종", group: "발표", icon: Trophy, noun: "발표" },
  // 원본 표기는 "충원 합격자 발표"지만 학생이 쓰고 검색하는 말은 "추합"이다.
  "additional-result": {
    label: "추가 합격 발표",
    short: "추합",
    hint: "충원 합격 발표",
    group: "발표",
    icon: UserPlus,
    noun: "발표",
  },
};

export const CATEGORY_GROUPS: { name: CategoryGroup; ids: CategoryId[] }[] = [
  { name: "제출", ids: ["application", "essay", "recommendation", "documents"] },
  { name: "평가", ids: ["interview"] },
  { name: "발표", ids: ["first-result", "final-result", "additional-result"] },
  { name: "등록", ids: ["registration"] },
];

/** v3에서 전체 종류를 선택했던 경우만 새 등록 종류를 포함한다. */
export function migrateCategorySelection(ids: CategoryId[]): CategoryId[] {
  const previous = CATEGORY_ORDER.filter((id) => id !== "registration");
  return ids.length === previous.length && previous.every((id) => ids.includes(id))
    ? [...CATEGORY_ORDER]
    : ids;
}

/** CSS 변수(--cat, --cat-soft)를 실어 나르는 클래스 이름 */
export function categoryClass(id: CategoryId) {
  return `cat-${id}`;
}

export function categoryLabel(id: CategoryId) {
  return CATEGORY_UI[id].label;
}

export function isResult(id: CategoryId) {
  return CATEGORY_UI[id].group === "발표";
}
