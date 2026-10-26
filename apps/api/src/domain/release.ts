export type EpisodeStatus = "draft" | "scheduled" | "published" | "suspended";
export interface ReleaseWindow { status: EpisodeStatus; releaseAt: string | Date | null; endAt: string | Date | null; }
const milliseconds = (value: string | Date | null): number | null => {
  if (!value) return null;
  const n = new Date(value).getTime();
  return Number.isFinite(n) ? n : null;
};
export function publicEpisodeState(episode: ReleaseWindow, now: Date = new Date()) {
  if (episode.status === "draft" || episode.status === "suspended") return "hidden" as const;
  const start = milliseconds(episode.releaseAt);
  const end = milliseconds(episode.endAt);
  if (start === null) return "hidden" as const;
  if (start > now.getTime()) return "upcoming" as const;
  if (end !== null && end <= now.getTime()) return "ended" as const;
  return "available" as const;
}
export function sanitizedYoutubeId(id: unknown): string | null {
  return typeof id === "string" && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
}
