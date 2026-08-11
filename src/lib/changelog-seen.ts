export const CHANGELOG_STORAGE_KEY = "ma_last_seen_changelog";

export function getLastSeenChangelog(): string | null {
  try {
    return localStorage.getItem(CHANGELOG_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function markChangelogSeen(): void {
  try {
    localStorage.setItem(CHANGELOG_STORAGE_KEY, new Date().toISOString());
  } catch {
    // localStorage unavailable (private mode); the unread dot just reappears next session
  }
}
