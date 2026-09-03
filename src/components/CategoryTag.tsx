import type { AdmissionCategory } from "../types";

export function categoryClassName(category: AdmissionCategory) {
  return `category-${category.replace(/\s/g, "-")}`;
}

export function CategoryTag({ category }: { category: AdmissionCategory }) {
  return <span className={`category-tag ${categoryClassName(category)}`}>{category}</span>;
}

