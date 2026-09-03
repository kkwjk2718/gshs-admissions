export type AdmissionCategory =
  | "원서 접수"
  | "자소서 입력"
  | "추천서 입력"
  | "서류 제출"
  | "면접"
  | "합격 발표"
  | "기타";

export interface AdmissionEvent {
  id: string;
  university: string;
  category: AdmissionCategory;
  title: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface AdmissionGuide {
  url: string;
  label: string;
  kind: "guide" | "admissions-page";
  verifiedAt: string;
}

export interface ScheduleCell {
  label: string;
  value: string;
}

export interface ScheduleGroup {
  university: string;
  period: string;
  rows: ScheduleCell[];
}
