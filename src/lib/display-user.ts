/**
 * Display a user's identity with fallback chain:
 * full_name → email → truncated user_id → "Unknown"
 */
export function displayUserName(user: {
  full_name?: string | null;
  email?: string | null;
  id?: string;
}): string {
  if (user.full_name && user.full_name.trim()) return user.full_name;
  if (user.email) return user.email;
  if (user.id) return user.id.substring(0, 8);
  return "Unknown";
}
