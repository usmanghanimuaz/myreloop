/** Preferences only, never authorization. Versioned to avoid unrelated storage/metadata. */
export const MISSION_META_KEY = "reloop_mission_dismissed_v1";
export function missionStorageKey(userId: string | null) {
  return `reloop-mission:v1:${userId ?? "guest"}`;
}
export function hasMissionDismissal(metadata: Record<string, unknown> | undefined) {
  return metadata?.[MISSION_META_KEY] === true;
}
