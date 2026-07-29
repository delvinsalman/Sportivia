const FIRST_VISIT_GUIDE_KEY = 'sportivia-first-visit-guide-v1';

export function hasCompletedFirstVisitGuide(): boolean {
  try {
    return localStorage.getItem(FIRST_VISIT_GUIDE_KEY) === '1';
  } catch {
    return false;
  }
}

export function completeFirstVisitGuide(): void {
  try {
    localStorage.setItem(FIRST_VISIT_GUIDE_KEY, '1');
  } catch {
    /* The guide can still continue when storage is unavailable. */
  }
}
