export interface NotificationSettings {
  periodWarningDays: number;
  pmsWarningDays: number;
  fertilityWarningDays: number;
  enableVibrations: boolean;
}

export interface UserPreferences {
  theme: string;
  notificationSettings: NotificationSettings;
  privacy: {
    cloudBackup: boolean;
    encrypted: boolean;
  };
}

export interface PeriodEntry {
  startDate: string; // YYYY-MM-DD
  lengthDays: number;
  notes: string;
}

export interface CycleComputed {
  lastPeriodStart: string;
  predictedNextStart: string;
  predictedOvulation: string;
  fertileWindowStart: string;
  fertileWindowEnd: string;
}

export interface CycleStats {
  periodHistory: PeriodEntry[];
  avgCycleLength: number;
  avgPeriodLength: number;
  computed: CycleComputed;
}

export interface LoveLog {
  date: string;
  rating: number; // 1-5
  note: string;
}

export interface SpecialDate {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  recurrence: 'yearly' | 'monthly' | 'none';
  reminderDays: number;
}

export interface TimePassedEntry {
  id: string;
  title: string;
  dateTime: string; // ISO string for full date and time
}

export interface UserData {
  id: string;
  name: string;
  preferences: UserPreferences;
  cycleStats: CycleStats;
  loveMeter: LoveLog[];
  specialDates: SpecialDate[];
  journal: JournalEntry[];
  timePassedEntries: TimePassedEntry[];
}

export interface JournalEntry {
  id: string;
  date: string;
  content: string;
  mood?: string;
}

export interface AppState {
  user: UserData | null;
  isLoading: boolean;
  view: 'onboarding' | 'home' | 'calendar' | 'love-meter' | 'special-dates' | 'settings' | 'journal' | 'time-passed';
}