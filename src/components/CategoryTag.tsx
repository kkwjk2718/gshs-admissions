import { CATEGORY_UI, categoryClass } from "../lib/categories";
import type { CategoryId } from "../types";

interface CategoryTagProps {
  id: CategoryId;
  /** 폭이 좁은 자리에서는 "충원"처럼 줄인 이름을 쓴다 */
  short?: boolean;
  size?: "sm" | "md";
}

export function CategoryTag({ id, short = false, size = "md" }: CategoryTagProps) {
  const meta = CATEGORY_UI[id];
  const Icon = meta.icon;

  return (
    <span className={`tag tag--category tag--${size} ${categoryClass(id)}`}>
      <Icon size={size === "sm" ? 13 : 15} aria-hidden="true" />
      {short ? meta.short : meta.label}
    </span>
  );
}

export function UniversityTag({ name }: { name: string }) {
  return <span className="tag tag--university">{name}</span>;
}
