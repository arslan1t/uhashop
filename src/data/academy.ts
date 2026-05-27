// ── UHA Academy — Data types & mock data ─────────────────────────────

// ── Types ────────────────────────────────────────────────────────────
export type AgeGroup = "U-10" | "U-12" | "U-14" | "U-16" | "U-18";
export type Position = "PG" | "SG" | "SF" | "PF" | "C";
export type AthleteStatus = "active" | "trial" | "inactive";
export type SessionType = "training" | "game" | "individual" | "masterclass";
export type ExerciseCategory = "shooting" | "dribbling" | "defense" | "conditioning" | "agility" | "teamwork";
export type PaymentStatus = "paid" | "pending" | "overdue";
export type EventType = "tournament_3x3" | "tournament_5x5" | "camp" | "open_training" | "masterclass_event";
export type BadgeRarity = "common" | "rare" | "epic" | "legendary";
export type ProgressMetric = "shooting_pct" | "free_throws" | "speed" | "vertical_jump" | "stamina" | "dribbling_score";

export interface AcademyAthlete {
  id: string;
  name: string;
  birthDate: string;
  ageGroup: AgeGroup;
  position: Position;
  height?: number;
  weight?: number;
  avatar?: string;
  parentId: string;
  status: AthleteStatus;
  joinedAt: string;
  phone?: string;
  pin: string;
}

export interface AcademyParent {
  id: string;
  name: string;
  phone: string;
  telegram?: string;
  email?: string;
  childrenIds: string[];
  pin: string;
  createdAt: string;
}

export interface TrainingSession {
  id: string;
  title: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  type: SessionType;
  location: string;
  coach: string;
  ageGroup?: AgeGroup;
  athleteIds?: string[];
  description?: string;
}

export interface Exercise {
  id: string;
  athleteId: string;
  title: string;
  description: string;
  category: ExerciseCategory;
  sets?: number;
  reps?: number;
  duration?: string;
  videoUrl?: string;
  assignedDate: string;
  completed: boolean;
  completedAt?: string;
}

export interface Payment {
  id: string;
  parentId: string;
  athleteId: string;
  amount: number;
  month: string;
  status: PaymentStatus;
  paidAt?: string;
  notes?: string;
}

// ── Events (Calendar) ───────────────────────────────────────────────
export interface AcademyEvent {
  id: string;
  title: string;
  description: string;
  type: EventType;
  date: string;
  timeStart: string;
  timeEnd: string;
  location: string;
  ageGroups: AgeGroup[];
  maxParticipants?: number;
  registeredIds?: string[];
  fee?: number;
  coverImage?: string;
}

// ── Achievements / Badges ───────────────────────────────────────────
export interface AcademyBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: BadgeRarity;
  criteria: string;
}

export interface AthleteBadge {
  badgeId: string;
  athleteId: string;
  earnedAt: string;
}

// ── Progress Tracking ───────────────────────────────────────────────
export interface ProgressEntry {
  id: string;
  athleteId: string;
  metric: ProgressMetric;
  value: number;
  date: string;
  notes?: string;
}

// ── Media Gallery ───────────────────────────────────────────────────
export interface MediaItem {
  id: string;
  url: string;
  thumbnail?: string;
  type: "photo" | "video";
  caption?: string;
  date: string;
  athleteIds?: string[];
  ageGroup?: AgeGroup;
  eventId?: string;
  uploadedBy?: string;
}

// ── Labels ───────────────────────────────────────────────────────────
export const POSITION_LABELS: Record<Position, string> = {
  PG: "Разыгрывающий",
  SG: "Атакующий защитник",
  SF: "Лёгкий форвард",
  PF: "Тяжёлый форвард",
  C: "Центровой",
};

export const POSITION_SHORT: Record<Position, string> = {
  PG: "PG", SG: "SG", SF: "SF", PF: "PF", C: "C",
};

export const SESSION_TYPE_LABELS: Record<SessionType, string> = {
  training: "Тренировка",
  game: "Игра",
  individual: "Индивидуальная",
  masterclass: "Мастер-класс",
};

export const SESSION_TYPE_COLORS: Record<SessionType, string> = {
  training: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  game: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  individual: "bg-purple-500/15 text-purple-400 border-purple-500/25",
  masterclass: "bg-amber-500/15 text-amber-400 border-amber-500/25",
};

export const EXERCISE_CATEGORY_LABELS: Record<ExerciseCategory, string> = {
  shooting: "Броски",
  dribbling: "Дриблинг",
  defense: "Защита",
  conditioning: "Физподготовка",
  agility: "Ловкость",
  teamwork: "Командная работа",
};

export const EXERCISE_CATEGORY_ICONS: Record<ExerciseCategory, string> = {
  shooting: "🎯",
  dribbling: "🏀",
  defense: "🛡️",
  conditioning: "💪",
  agility: "⚡",
  teamwork: "🤝",
};

export const STATUS_LABELS: Record<AthleteStatus, string> = {
  active: "Активный",
  trial: "Пробный",
  inactive: "Неактивный",
};

export const STATUS_COLORS: Record<AthleteStatus, string> = {
  active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  trial: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  inactive: "bg-red-500/15 text-red-400 border-red-500/25",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  paid: "Оплачено",
  pending: "Ожидает",
  overdue: "Просрочено",
};

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  paid: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  pending: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  overdue: "bg-red-500/15 text-red-400 border-red-500/25",
};

// ── Event Labels ────────────────────────────────────────────────────
export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  tournament_3x3: "Турнир 3x3",
  tournament_5x5: "Турнир 5x5",
  camp: "Лагерь",
  open_training: "Открытая тренировка",
  masterclass_event: "Мастер-класс",
};

export const EVENT_TYPE_COLORS: Record<EventType, string> = {
  tournament_3x3: "bg-orange-500/15 text-orange-400 border-orange-500/25",
  tournament_5x5: "bg-red-500/15 text-red-400 border-red-500/25",
  camp: "bg-teal-500/15 text-teal-400 border-teal-500/25",
  open_training: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  masterclass_event: "bg-amber-500/15 text-amber-400 border-amber-500/25",
};

export const EVENT_TYPE_ICONS: Record<EventType, string> = {
  tournament_3x3: "🏀",
  tournament_5x5: "🏆",
  camp: "🏕️",
  open_training: "🎯",
  masterclass_event: "⭐",
};

export const BADGE_RARITY_LABELS: Record<BadgeRarity, string> = {
  common: "Обычный",
  rare: "Редкий",
  epic: "Эпический",
  legendary: "Легендарный",
};

export const BADGE_RARITY_COLORS: Record<BadgeRarity, string> = {
  common: "bg-zinc-500/15 text-zinc-400 border-zinc-500/25",
  rare: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  epic: "bg-purple-500/15 text-purple-400 border-purple-500/25",
  legendary: "bg-amber-500/15 text-amber-400 border-amber-500/25",
};

export const PROGRESS_METRIC_LABELS: Record<ProgressMetric, string> = {
  shooting_pct: "Процент попаданий",
  free_throws: "Штрафные %",
  speed: "Скорость (сек)",
  vertical_jump: "Вертикальный прыжок (см)",
  stamina: "Выносливость (мин)",
  dribbling_score: "Дриблинг (балл)",
};

export const PROGRESS_METRIC_ICONS: Record<ProgressMetric, string> = {
  shooting_pct: "🎯",
  free_throws: "🏀",
  speed: "⚡",
  vertical_jump: "📈",
  stamina: "💪",
  dribbling_score: "🤹",
};

export const PROGRESS_METRIC_UNITS: Record<ProgressMetric, string> = {
  shooting_pct: "%",
  free_throws: "%",
  speed: "сек",
  vertical_jump: "см",
  stamina: "мин",
  dribbling_score: "балл",
};

// ── Helper ───────────────────────────────────────────────────────────
function todayPlus(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function monthStr(offset: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + offset);
  return d.toISOString().slice(0, 7);
}

// ── Mock data ────────────────────────────────────────────────────────
export const MOCK_PARENTS: AcademyParent[] = [
  {
    id: "p1", name: "Камол Рашидов", phone: "+998901234567",
    telegram: "@kamal_r", email: "kamal@mail.uz",
    childrenIds: ["a1", "a2"], pin: "1234", createdAt: "2024-09-01",
  },
  {
    id: "p2", name: "Дильноза Хасанова", phone: "+998907654321",
    telegram: "@dilnoza_h",
    childrenIds: ["a3"], pin: "5678", createdAt: "2024-10-15",
  },
  {
    id: "p3", name: "Бобур Тошматов", phone: "+998905555555",
    telegram: "@bobur_t",
    childrenIds: ["a4", "a5"], pin: "9012", createdAt: "2024-11-01",
  },
];

export const MOCK_ATHLETES: AcademyAthlete[] = [
  {
    id: "a1", name: "Алишер Рашидов", birthDate: "2012-03-15",
    ageGroup: "U-14", position: "PG", height: 165, weight: 52,
    parentId: "p1", status: "active", joinedAt: "2024-09-01", pin: "1111",
  },
  {
    id: "a2", name: "Жасур Рашидов", birthDate: "2014-07-22",
    ageGroup: "U-12", position: "SG", height: 148, weight: 40,
    parentId: "p1", status: "active", joinedAt: "2024-09-01", pin: "2222",
  },
  {
    id: "a3", name: "Нодира Хасанова", birthDate: "2010-01-10",
    ageGroup: "U-16", position: "SF", height: 175, weight: 62,
    parentId: "p2", status: "active", joinedAt: "2024-10-15", pin: "3333",
  },
  {
    id: "a4", name: "Санжар Тошматов", birthDate: "2011-11-03",
    ageGroup: "U-14", position: "PF", height: 170, weight: 58,
    parentId: "p3", status: "trial", joinedAt: "2024-11-01", pin: "4444",
  },
  {
    id: "a5", name: "Малика Тошматова", birthDate: "2015-05-20",
    ageGroup: "U-10", position: "PG", height: 138, weight: 32,
    parentId: "p3", status: "active", joinedAt: "2024-11-01", pin: "5555",
  },
];

export const MOCK_SCHEDULE: TrainingSession[] = [
  {
    id: "s1", title: "Утренняя тренировка U-14",
    date: todayPlus(0), timeStart: "09:00", timeEnd: "10:30",
    type: "training", location: "Зал UHA Arena", coach: "Тренер Исмаилов",
    ageGroup: "U-14", description: "Работа над дриблингом и быстрым прорывом",
  },
  {
    id: "s2", title: "Индивидуальная с Алишером",
    date: todayPlus(0), timeStart: "14:00", timeEnd: "15:00",
    type: "individual", location: "Зал UHA Arena", coach: "Тренер Исмаилов",
    athleteIds: ["a1"],
  },
  {
    id: "s3", title: "Тренировка U-12",
    date: todayPlus(1), timeStart: "10:00", timeEnd: "11:30",
    type: "training", location: "Зал UHA Arena", coach: "Тренер Каримов",
    ageGroup: "U-12",
  },
  {
    id: "s4", title: "Мастер-класс от НБЛ",
    date: todayPlus(1), timeStart: "16:00", timeEnd: "18:00",
    type: "masterclass", location: "Зал UHA Arena", coach: "Гостевой тренер",
    description: "Специальный мастер-класс по защите от игрока НБЛ",
  },
  {
    id: "s5", title: "Товарищеская игра U-16",
    date: todayPlus(2), timeStart: "11:00", timeEnd: "12:30",
    type: "game", location: "Зал Олимпия", coach: "Тренер Исмаилов",
    ageGroup: "U-16", description: "Против команды Самарканда",
  },
  {
    id: "s6", title: "Утренняя тренировка U-14",
    date: todayPlus(3), timeStart: "09:00", timeEnd: "10:30",
    type: "training", location: "Зал UHA Arena", coach: "Тренер Исмаилов",
    ageGroup: "U-14",
  },
  {
    id: "s7", title: "Тренировка U-10",
    date: todayPlus(3), timeStart: "15:00", timeEnd: "16:00",
    type: "training", location: "Зал UHA Arena", coach: "Тренер Каримов",
    ageGroup: "U-10",
  },
  {
    id: "s8", title: "Индивидуальная с Нодирой",
    date: todayPlus(4), timeStart: "10:00", timeEnd: "11:00",
    type: "individual", location: "Зал UHA Arena", coach: "Тренер Исмаилов",
    athleteIds: ["a3"],
  },
  {
    id: "s9", title: "Тренировка U-14",
    date: todayPlus(5), timeStart: "09:00", timeEnd: "10:30",
    type: "training", location: "Зал UHA Arena", coach: "Тренер Исмаилов",
    ageGroup: "U-14",
  },
  {
    id: "s10", title: "Тренировка U-16",
    date: todayPlus(6), timeStart: "10:00", timeEnd: "11:30",
    type: "training", location: "Зал UHA Arena", coach: "Тренер Исмаилов",
    ageGroup: "U-16",
  },
];

export const MOCK_EXERCISES: Exercise[] = [
  {
    id: "e1", athleteId: "a1", title: "Штрафные броски",
    description: "Серия бросков со штрафной линии. Цель: 70% попаданий.",
    category: "shooting", sets: 5, reps: 10,
    assignedDate: todayPlus(0), completed: false,
  },
  {
    id: "e2", athleteId: "a1", title: "Кроссовер дриблинг",
    description: "Работа с мячом через конусы. Упор на скорость смены рук.",
    category: "dribbling", sets: 3, duration: "5 мин",
    assignedDate: todayPlus(0), completed: true, completedAt: todayPlus(0),
  },
  {
    id: "e3", athleteId: "a1", title: "Челночный бег 4x10",
    description: "Скоростная работа ног. Интервалы 30 сек отдыха.",
    category: "agility", sets: 6,
    assignedDate: todayPlus(0), completed: false,
  },
  {
    id: "e4", athleteId: "a1", title: "Защитная стойка",
    description: "Удержание защитной позиции, работа над скольжением.",
    category: "defense", duration: "10 мин",
    assignedDate: todayPlus(1), completed: false,
  },
  {
    id: "e5", athleteId: "a3", title: "Трёхочковые",
    description: "Серия бросков с разных точек за дугой.",
    category: "shooting", sets: 4, reps: 8,
    assignedDate: todayPlus(0), completed: false,
  },
  {
    id: "e6", athleteId: "a3", title: "Планка + прыжки",
    description: "Планка 1 мин + 20 выпрыгиваний. Отдых 45 сек.",
    category: "conditioning", sets: 4,
    assignedDate: todayPlus(0), completed: false,
  },
  {
    id: "e7", athleteId: "a2", title: "Ведение мяча слабой рукой",
    description: "Все упражнения выполнять левой рукой.",
    category: "dribbling", duration: "15 мин",
    assignedDate: todayPlus(0), completed: false,
  },
  {
    id: "e8", athleteId: "a4", title: "Подбор мяча + добивание",
    description: "Работа под кольцом: позиция, прыжок, добивание.",
    category: "teamwork", sets: 3, reps: 10,
    assignedDate: todayPlus(0), completed: false,
  },
];

export const MOCK_PAYMENTS: Payment[] = [
  { id: "pay1", parentId: "p1", athleteId: "a1", amount: 500000, month: monthStr(-2), status: "paid", paidAt: "2024-12-05" },
  { id: "pay2", parentId: "p1", athleteId: "a1", amount: 500000, month: monthStr(-1), status: "paid", paidAt: "2025-01-03" },
  { id: "pay3", parentId: "p1", athleteId: "a1", amount: 500000, month: monthStr(0), status: "pending" },
  { id: "pay4", parentId: "p1", athleteId: "a2", amount: 400000, month: monthStr(-2), status: "paid", paidAt: "2024-12-05" },
  { id: "pay5", parentId: "p1", athleteId: "a2", amount: 400000, month: monthStr(-1), status: "paid", paidAt: "2025-01-03" },
  { id: "pay6", parentId: "p1", athleteId: "a2", amount: 400000, month: monthStr(0), status: "pending" },
  { id: "pay7", parentId: "p2", athleteId: "a3", amount: 500000, month: monthStr(-1), status: "paid", paidAt: "2025-01-10" },
  { id: "pay8", parentId: "p2", athleteId: "a3", amount: 500000, month: monthStr(0), status: "overdue" },
  { id: "pay9", parentId: "p3", athleteId: "a4", amount: 350000, month: monthStr(0), status: "pending", notes: "Пробный период" },
  { id: "pay10", parentId: "p3", athleteId: "a5", amount: 350000, month: monthStr(0), status: "paid", paidAt: "2025-02-01" },
];

// ── Mock events ─────────────────────────────────────────────────────
export const MOCK_EVENTS: AcademyEvent[] = [
  {
    id: "ev1", title: "UHA Weekend 3x3", description: "Еженедельный турнир 3x3 для всех возрастных групп. Формат: round-robin + плей-офф.",
    type: "tournament_3x3", date: todayPlus(2), timeStart: "10:00", timeEnd: "16:00",
    location: "Площадка UHA Court", ageGroups: ["U-14", "U-16", "U-18"], maxParticipants: 24,
    registeredIds: ["a1", "a3", "a4"], fee: 50000,
  },
  {
    id: "ev2", title: "3x3 Street Battle", description: "Уличный турнир 3x3. Музыка, призы, атмосфера!",
    type: "tournament_3x3", date: todayPlus(9), timeStart: "14:00", timeEnd: "20:00",
    location: "Парк Навоий", ageGroups: ["U-16", "U-18"], maxParticipants: 16, fee: 75000,
  },
  {
    id: "ev3", title: "Кубок UHA Academy 5x5", description: "Ежемесячный турнир полного формата между группами академии.",
    type: "tournament_5x5", date: todayPlus(16), timeStart: "09:00", timeEnd: "18:00",
    location: "Зал UHA Arena", ageGroups: ["U-12", "U-14", "U-16"],
  },
  {
    id: "ev4", title: "Летний баскетбольный лагерь", description: "5-дневный интенсив: тренировки, тактика, командная работа, соревнования.",
    type: "camp", date: todayPlus(30), timeStart: "08:00", timeEnd: "17:00",
    location: "Спортбаза Чимган", ageGroups: ["U-12", "U-14", "U-16", "U-18"], maxParticipants: 40, fee: 1500000,
  },
  {
    id: "ev5", title: "Открытая тренировка для новичков", description: "Бесплатное пробное занятие для тех, кто хочет начать заниматься баскетболом.",
    type: "open_training", date: todayPlus(5), timeStart: "11:00", timeEnd: "12:30",
    location: "Зал UHA Arena", ageGroups: ["U-10", "U-12"],
  },
  {
    id: "ev6", title: "Мастер-класс: Работа ног", description: "Специальный мастер-класс от приглашённого тренера по footwork и защитным позициям.",
    type: "masterclass_event", date: todayPlus(12), timeStart: "15:00", timeEnd: "17:00",
    location: "Зал UHA Arena", ageGroups: ["U-14", "U-16", "U-18"],
  },
];

// ── Mock badges ─────────────────────────────────────────────────────
export const MOCK_BADGES: AcademyBadge[] = [
  { id: "b1", name: "Первая тренировка", description: "Посетил первую тренировку", icon: "🎯", rarity: "common", criteria: "Посетить 1 тренировку" },
  { id: "b2", name: "Недельная серия", description: "7 дней подряд выполнял все задания", icon: "🔥", rarity: "rare", criteria: "7 дней подряд 100% заданий" },
  { id: "b3", name: "Снайпер", description: "Процент попаданий выше 70%", icon: "🎯", rarity: "rare", criteria: "shooting_pct > 70" },
  { id: "b4", name: "Железная воля", description: "30 тренировок без пропусков", icon: "💪", rarity: "epic", criteria: "30 тренировок подряд" },
  { id: "b5", name: "Чемпион 3x3", description: "Победитель турнира 3x3", icon: "🏆", rarity: "epic", criteria: "Победа в турнире 3x3" },
  { id: "b6", name: "MVP сезона", description: "Самый ценный игрок сезона", icon: "⭐", rarity: "legendary", criteria: "Звание MVP" },
  { id: "b7", name: "Месяц дисциплины", description: "Полный месяц без пропусков и 100% заданий", icon: "📅", rarity: "epic", criteria: "30 дней 100% выполнения" },
  { id: "b8", name: "Командный игрок", description: "Лучший по командным заданиям", icon: "🤝", rarity: "rare", criteria: "Топ-1 по teamwork заданиям" },
];

export const MOCK_ATHLETE_BADGES: AthleteBadge[] = [
  { badgeId: "b1", athleteId: "a1", earnedAt: "2024-09-02" },
  { badgeId: "b2", athleteId: "a1", earnedAt: "2024-09-15" },
  { badgeId: "b3", athleteId: "a1", earnedAt: "2024-11-10" },
  { badgeId: "b5", athleteId: "a1", earnedAt: "2025-01-20" },
  { badgeId: "b1", athleteId: "a2", earnedAt: "2024-09-02" },
  { badgeId: "b1", athleteId: "a3", earnedAt: "2024-10-16" },
  { badgeId: "b2", athleteId: "a3", earnedAt: "2024-11-01" },
  { badgeId: "b4", athleteId: "a3", earnedAt: "2025-01-15" },
  { badgeId: "b6", athleteId: "a3", earnedAt: "2025-02-01" },
  { badgeId: "b1", athleteId: "a4", earnedAt: "2024-11-02" },
  { badgeId: "b1", athleteId: "a5", earnedAt: "2024-11-02" },
  { badgeId: "b8", athleteId: "a5", earnedAt: "2025-01-10" },
];

// ── Mock progress ───────────────────────────────────────────────────
export const MOCK_PROGRESS: ProgressEntry[] = [
  // Alisher - shooting
  { id: "pr1", athleteId: "a1", metric: "shooting_pct", value: 45, date: "2024-09-15" },
  { id: "pr2", athleteId: "a1", metric: "shooting_pct", value: 52, date: "2024-10-15" },
  { id: "pr3", athleteId: "a1", metric: "shooting_pct", value: 58, date: "2024-11-15" },
  { id: "pr4", athleteId: "a1", metric: "shooting_pct", value: 63, date: "2024-12-15" },
  { id: "pr5", athleteId: "a1", metric: "shooting_pct", value: 68, date: "2025-01-15" },
  { id: "pr6", athleteId: "a1", metric: "shooting_pct", value: 72, date: "2025-02-15" },
  // Alisher - speed
  { id: "pr7", athleteId: "a1", metric: "speed", value: 4.8, date: "2024-09-15" },
  { id: "pr8", athleteId: "a1", metric: "speed", value: 4.6, date: "2024-11-15" },
  { id: "pr9", athleteId: "a1", metric: "speed", value: 4.3, date: "2025-01-15" },
  // Alisher - vertical jump
  { id: "pr10", athleteId: "a1", metric: "vertical_jump", value: 38, date: "2024-09-15" },
  { id: "pr11", athleteId: "a1", metric: "vertical_jump", value: 42, date: "2024-12-15" },
  { id: "pr12", athleteId: "a1", metric: "vertical_jump", value: 46, date: "2025-02-15" },
  // Alisher - free throws
  { id: "pr13", athleteId: "a1", metric: "free_throws", value: 55, date: "2024-09-15" },
  { id: "pr14", athleteId: "a1", metric: "free_throws", value: 65, date: "2024-12-15" },
  { id: "pr15", athleteId: "a1", metric: "free_throws", value: 75, date: "2025-02-15" },
  // Nodira
  { id: "pr16", athleteId: "a3", metric: "shooting_pct", value: 50, date: "2024-10-15" },
  { id: "pr17", athleteId: "a3", metric: "shooting_pct", value: 60, date: "2024-12-15" },
  { id: "pr18", athleteId: "a3", metric: "shooting_pct", value: 67, date: "2025-02-15" },
  { id: "pr19", athleteId: "a3", metric: "vertical_jump", value: 35, date: "2024-10-15" },
  { id: "pr20", athleteId: "a3", metric: "vertical_jump", value: 40, date: "2025-01-15" },
  { id: "pr21", athleteId: "a3", metric: "stamina", value: 12, date: "2024-10-15" },
  { id: "pr22", athleteId: "a3", metric: "stamina", value: 18, date: "2025-01-15" },
  // Sanzhar
  { id: "pr23", athleteId: "a4", metric: "shooting_pct", value: 35, date: "2024-11-15" },
  { id: "pr24", athleteId: "a4", metric: "shooting_pct", value: 42, date: "2025-01-15" },
  { id: "pr25", athleteId: "a4", metric: "dribbling_score", value: 5, date: "2024-11-15" },
  { id: "pr26", athleteId: "a4", metric: "dribbling_score", value: 7, date: "2025-01-15" },
];

// ── Mock media ──────────────────────────────────────────────────────
export const MOCK_MEDIA: MediaItem[] = [
  { id: "m1", url: "/images/academy/training-1.jpg", type: "photo", caption: "Утренняя тренировка U-14", date: todayPlus(-2), ageGroup: "U-14", athleteIds: ["a1", "a4"] },
  { id: "m2", url: "/images/academy/training-2.jpg", type: "photo", caption: "Работа над бросками", date: todayPlus(-3), ageGroup: "U-14", athleteIds: ["a1"] },
  { id: "m3", url: "/images/academy/game-1.jpg", type: "photo", caption: "Товарищеская игра U-16", date: todayPlus(-5), ageGroup: "U-16", athleteIds: ["a3"] },
  { id: "m4", url: "/images/academy/team-photo.jpg", type: "photo", caption: "Командное фото после турнира 3x3", date: todayPlus(-7), athleteIds: ["a1", "a3", "a4"] },
  { id: "m5", url: "/images/academy/masterclass.jpg", type: "photo", caption: "Мастер-класс от НБЛ", date: todayPlus(-10) },
  { id: "m6", url: "/images/academy/camp-1.jpg", type: "photo", caption: "Летний лагерь — общее фото", date: todayPlus(-14) },
  { id: "m7", url: "https://www.youtube.com/watch?v=example1", type: "video", caption: "Хайлайты турнира 3x3", date: todayPlus(-7), ageGroup: "U-14" },
  { id: "m8", url: "https://www.youtube.com/watch?v=example2", type: "video", caption: "Лучшие моменты сезона", date: todayPlus(-21) },
];

// ── Helpers ──────────────────────────────────────────────────────────
export function getAthleteSchedule(athleteId: string, athletes: AcademyAthlete[], schedule: TrainingSession[]): TrainingSession[] {
  const athlete = athletes.find(a => a.id === athleteId);
  if (!athlete) return [];
  return schedule.filter(s =>
    s.athleteIds?.includes(athleteId) || s.ageGroup === athlete.ageGroup || (!s.ageGroup && !s.athleteIds)
  ).sort((a, b) => `${a.date}${a.timeStart}`.localeCompare(`${b.date}${b.timeStart}`));
}

export function formatDateRu(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const days = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
  const months = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`;
}

export function isToday(dateStr: string): boolean {
  return dateStr === new Date().toISOString().slice(0, 10);
}

export function formatMonthRu(monthStr: string): string {
  const [y, m] = monthStr.split("-");
  const months = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
  return `${months[parseInt(m) - 1]} ${y}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("uz-UZ").format(amount) + " сум";
}
