/**
 * Server-only scoped readers for the public Academy login/dashboard.
 * Unlike the admin academy API, these NEVER return the full roster or PINs —
 * only the data relevant to the authenticated athlete/parent.
 */
import { getAdminDb } from "@/lib/firebase/admin";
import {
  getAthleteSchedule,
  type AcademyAthlete, type AcademyParent, type TrainingSession,
  type Exercise, type Payment, type AcademyEvent, type AcademyBadge,
  type AthleteBadge, type ProgressEntry, type MediaItem, type AcademyNote,
} from "@/data/academy";

async function col<T>(name: string): Promise<T[]> {
  const snap = await getAdminDb().collection(name).get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() })) as T[];
}

async function whereIn<T>(name: string, field: string, values: string[]): Promise<T[]> {
  if (values.length === 0) return [];
  const snap = await getAdminDb().collection(name).where(field, "in", values.slice(0, 30)).get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() })) as T[];
}

// Two passes: by id (collapses the same session matching a parent's several
// children) and by content (collapses genuinely separate Firestore docs that
// describe the same training — e.g. created twice by mistake in the admin
// panel) so a family never sees one training listed several times in a row.
function dedupeSessions(sessions: TrainingSession[]): TrainingSession[] {
  const byId = sessions.filter((s, i, arr) => arr.findIndex(x => x.id === s.id) === i);
  const seen = new Set<string>();
  return byId.filter(s => {
    const key = `${s.date}_${s.timeStart}_${s.title.trim().toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export interface AthleteScope {
  role: "athlete";
  athlete: AcademyAthlete;
  schedule: TrainingSession[];
  exercises: Exercise[];
  progress: ProgressEntry[];
  athleteBadges: AthleteBadge[];
  badges: AcademyBadge[];
  events: AcademyEvent[];
  media: MediaItem[];
  notes: AcademyNote[];
}

export interface ParentScope {
  role: "parent";
  parent: AcademyParent;
  children: AcademyAthlete[];
  schedule: TrainingSession[];
  exercises: Exercise[];
  payments: Payment[];
  progress: ProgressEntry[];
  athleteBadges: AthleteBadge[];
  badges: AcademyBadge[];
  events: AcademyEvent[];
  media: MediaItem[];
  notes: AcademyNote[];
}

/** Newest-first notes for the given athlete ids. */
function sortNotes(notes: AcademyNote[]): AcademyNote[] {
  return [...notes].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

export async function buildAthleteScope(athleteId: string): Promise<AthleteScope | null> {
  const db = getAdminDb();
  const athleteSnap = await db.collection("academy_athletes").doc(athleteId).get();
  if (!athleteSnap.exists) return null;
  const athlete = { id: athleteSnap.id, ...athleteSnap.data() } as AcademyAthlete;
  const todayStr = new Date().toISOString().slice(0, 10);

  const [allSchedule, exercises, progress, athleteBadges, badges, allEvents, allMedia, notes] = await Promise.all([
    col<TrainingSession>("academy_schedule"),
    whereIn<Exercise>("academy_exercises", "athleteId", [athleteId]),
    whereIn<ProgressEntry>("academy_progress", "athleteId", [athleteId]),
    whereIn<AthleteBadge>("academy_athlete_badges", "athleteId", [athleteId]),
    col<AcademyBadge>("academy_badges"),
    col<AcademyEvent>("academy_events"),
    col<MediaItem>("academy_media"),
    whereIn<AcademyNote>("academy_notes", "athleteId", [athleteId]),
  ]);

  const schedule = dedupeSessions(getAthleteSchedule(athleteId, [athlete], allSchedule));
  const events = allEvents.filter(e =>
    e.date >= todayStr && (e.ageGroups.includes(athlete.ageGroup) || e.registeredIds?.includes(athleteId))
  );
  const media = allMedia.filter(m => m.athleteIds?.includes(athleteId) || m.ageGroup === athlete.ageGroup);

  return { role: "athlete", athlete, schedule, exercises, progress, athleteBadges, badges, events, media, notes: sortNotes(notes) };
}

export async function buildParentScope(parentId: string): Promise<ParentScope | null> {
  const db = getAdminDb();
  const parentSnap = await db.collection("academy_parents").doc(parentId).get();
  if (!parentSnap.exists) return null;
  const parent = { id: parentSnap.id, ...parentSnap.data() } as AcademyParent;
  const childIds = parent.childrenIds ?? [];
  const todayStr = new Date().toISOString().slice(0, 10);

  const [children, allSchedule, exercises, payments, progress, athleteBadges, badges, allEvents, allMedia, notes] = await Promise.all([
    whereIn<AcademyAthlete>("academy_athletes", "id", childIds),
    col<TrainingSession>("academy_schedule"),
    whereIn<Exercise>("academy_exercises", "athleteId", childIds),
    db.collection("academy_payments").where("parentId", "==", parentId).get()
      .then(s => s.docs.map(d => ({ id: d.id, ...d.data() })) as Payment[]),
    whereIn<ProgressEntry>("academy_progress", "athleteId", childIds),
    whereIn<AthleteBadge>("academy_athlete_badges", "athleteId", childIds),
    col<AcademyBadge>("academy_badges"),
    col<AcademyEvent>("academy_events"),
    col<MediaItem>("academy_media"),
    whereIn<AcademyNote>("academy_notes", "athleteId", childIds),
  ]);

  const childAgeGroups = [...new Set(children.map(c => c.ageGroup))];
  const schedule = dedupeSessions(children.flatMap(c => getAthleteSchedule(c.id, children, allSchedule)));
  const events = allEvents.filter(e => e.date >= todayStr && e.ageGroups.some(ag => childAgeGroups.includes(ag)));
  const media = allMedia.filter(m =>
    m.athleteIds?.some(id => childIds.includes(id)) || (m.ageGroup && childAgeGroups.includes(m.ageGroup))
  );

  return { role: "parent", parent, children, schedule, exercises, payments, progress, athleteBadges, badges, events, media, notes: sortNotes(notes) };
}
