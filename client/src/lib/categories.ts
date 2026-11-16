import type { TFunction } from 'i18next';

export const CATEGORY_KEYS: Record<string, string> = {
  pothole: 'issueForm.categoryPothole',
  streetlight: 'issueForm.categoryStreetlight',
  graffiti: 'issueForm.categoryGraffiti',
  waste: 'issueForm.categoryWaste',
  other: 'issueForm.categoryOther',
};

export function categoryLabel(t: TFunction, category: string): string {
  const key = CATEGORY_KEYS[category];
  return key ? t(key) : category;
}