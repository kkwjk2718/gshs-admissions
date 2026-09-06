export type CategoryId =
  | "application"
  | "essay"
  | "recommendation"
  | "documents"
  | "first-result"
  | "interview"
  | "final-result"
  | "additional-result"
  | "registration"
  | "written-exam"
  | "exam-notice"
  | "stage-fee"
  | "registration-program";

export interface CategoryMeta {
  id: CategoryId;
  /** 필터·상세에 쓰는 정식 라벨 (예: "충원 합격자 발표") */
  label: string;
  /** 원본 PDF 표기 */
  sourceLabel: string;
  /** 달력 칩처럼 폭이 좁은 자리용 (예: "충원") */
  shortLabel: string;
  eventCount: number;
}

export interface UniversityMeta {
  id: string;
  name: string;
  tag: string;
  eventCount: number;
}

export interface AdmissionEvent {
  id: string;
  uid: string;
  universityId: string;
  university: string;
  categoryId: CategoryId;
  category: string;
  sourceCategory: string;
  /** 전형명. 예: "창의도전전형, 일반전형/ 고른기회/특기자/ 반도체시스템" */
  admissionDetail: string;
  startDate: string;
  endDate: string;
  /** 기간 일정의 마지막 날. 현재 데이터에서는 항상 endDate와 같다. */
  deadlineDate: string;
  isDateRange: boolean;
  /** 원문에서 뽑은 마감·발표 시각. 0개 또는 1개. */
  timeLabels: string[];
  /** 접수·발표에서 제외되는 날 */
  excludedDates: string[];
  /** 원본 PDF의 일정 문자열 그대로 */
  rawSchedule: string;
  description: string;
  note: string;
}

export interface AdmissionGuide {
  url: string;
  label: string;
  kind: "guide" | "admissions-page";
  verifiedAt: string;
}

export interface ScheduleColumn {
  key: string;
  label: string;
}

export interface ScheduleSourceCell {
  text: string;
  rowSpan?: number;
}

export interface ScheduleSourceRow {
  id: string;
  universityId: string;
  university: string;
  cells: Record<string, ScheduleSourceCell | null>;
}

export interface SchedulePage {
  page: number;
  columnKeys: string[];
  columns: ScheduleColumn[];
  rows: ScheduleSourceRow[];
}

export interface AdmissionsTable {
  title: string;
  notice: string;
  rowCount: number;
  universityOrder: string[];
  pages: SchedulePage[];
}

export interface AdmissionsMeta {
  academicYear: number;
  calendarYear: number;
  calendarName: string;
  timezone: string;
  eventCount: number;
  universityCount: number;
  tableRowCount: number;
  dateRange: { start: string; end: string };
  notice: string;
}

export interface AdmissionsDataset {
  meta: AdmissionsMeta;
  categories: CategoryMeta[];
  universities: UniversityMeta[];
  events: AdmissionEvent[];
  admissionsTable: AdmissionsTable;
}
