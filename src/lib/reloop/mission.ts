/** Preferences only, never authorization. Versioned, identity-scoped browser cache. */
export function missionStorageKey(userId: string | null) {
  return `reloop-mission:v1:${userId ?? "guest"}`;
}
export function hasMissionDismissal(value: unknown) {
  return value === true;
}
