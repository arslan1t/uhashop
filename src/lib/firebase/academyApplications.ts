/**
 * Types for UHA Academy applications (collection: "academy_applications").
 *
 * Reads/writes go through the Admin SDK — /api/academy/apply (public submit,
 * REST API + key) and /api/admin/academy (admin read/update) — never the
 * client Firestore SDK, since security rules deny client reads with no
 * Firebase Auth session (this app's admin login is a separate custom-token
 * system, so the client is never actually authenticated with Firebase).
 */

export type ApplicationStatus = "new" | "contacted" | "enrolled" | "rejected";
export type SkillLevel = "beginner" | "intermediate" | "advanced" | "pro";

export interface AcademyApplication {
  id?: string;
  parentName: string;
  parentTg: string;
  parentPhone?: string;
  age: number;
  athleteName?: string;
  height?: number;
  weight?: number;
  skillLevel?: SkillLevel;
  notes?: string;
  status: ApplicationStatus;
  createdAt: unknown; // Firestore Timestamp
  updatedAt?: unknown;
  /** Self-registered via the Telegram bot instead of the website apply form.
   *  parentName holds the registrant's own name in this case, regardless of
   *  role — "Спортсмен"/"Родитель" label is derived from `role` in the UI. */
  source?: "website" | "bot";
  role?: "athlete" | "parent";
  chatId?: number;
  telegramId?: number;
  /** Set once a trainer enrolls a bot signup into a real account. */
  linkedAccountId?: string;
}
