export interface CalendarState {
  currentYear: number;
  currentMonth: number; // 0-indexed
  selectedRange: { start: Date | null; end: Date | null };
  hoverDate: Date | null;
  selectionPhase: 'idle' | 'selecting-end';
}

export interface Note {
  id: string;
  text: string;
  createdAt: string;
  isCompleted?: boolean;
}

export type NotesStore = Record<string, Note[]>;
// key format: "general_2025-04" or "range_2025-04-10_2025-04-15"

export interface ThemeConfig {
  accent: string;      // hex
  accentLight: string; // hex (10% opacity version)
  accentDark: string;  // hex
  name: string;
}

export interface HolidayEvent {
  date: string; // "YYYY-MM-DD"
  name: string;
  type: 'national' | 'observance';
}

export interface EventDot {
  date: string; // "YYYY-MM-DD"
  color: string;
  label: string;
}

export type CalendarAction =
  | { type: 'NEXT_MONTH' }
  | { type: 'PREV_MONTH' }
  | { type: 'SET_HOVER_DATE'; payload: Date | null }
  | { type: 'CLEAR_HOVER' }
  | { type: 'CLICK_DATE'; payload: Date }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'GO_TO_TODAY' }
  | { type: 'GO_TO_MONTH'; payload: { year: number; month: number } };

export interface StarredDate {
  dateKey: string; // 'YYYY-MM-DD'
  color: string;   // hex or tailwind color name
  label?: string;
}

export interface RecurringEvent {
  baseDate: string; // YYYY-MM-DD
  color: string;
  frequency: 'weekly' | 'monthly' | 'yearly';
  label?: string;
}
