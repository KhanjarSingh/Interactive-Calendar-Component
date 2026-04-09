import { useReducer } from 'react';
import { CalendarState, CalendarAction } from './types';
import { isBefore } from 'date-fns';

const today = new Date();

const initialState: CalendarState = {
  currentYear: today.getFullYear(),
  currentMonth: today.getMonth(),
  selectedRange: { start: null, end: null },
  hoverDate: null,
  selectionPhase: 'idle',
};

function calendarReducer(state: CalendarState, action: CalendarAction): CalendarState {
  switch (action.type) {
    case 'NEXT_MONTH': {
      const nextMonth = state.currentMonth + 1;
      return {
        ...state,
        currentYear: nextMonth > 11 ? state.currentYear + 1 : state.currentYear,
        currentMonth: nextMonth > 11 ? 0 : nextMonth,
        // Clear selection and hover when navigating months
        selectedRange: { start: null, end: null },
        selectionPhase: 'idle',
        hoverDate: null,
      };
    }
    case 'PREV_MONTH': {
      const prevMonth = state.currentMonth - 1;
      return {
        ...state,
        currentYear: prevMonth < 0 ? state.currentYear - 1 : state.currentYear,
        currentMonth: prevMonth < 0 ? 11 : prevMonth,
        // Clear selection and hover when navigating months
        selectedRange: { start: null, end: null },
        selectionPhase: 'idle',
        hoverDate: null,
      };
    }
    case 'SET_HOVER_DATE':
      // Only update when actively selecting, avoids stale previews
      if (state.selectionPhase !== 'selecting-end') return state;
      return { ...state, hoverDate: action.payload };
    case 'CLEAR_HOVER':
      return { ...state, hoverDate: null };
    case 'CLICK_DATE': {
      const clickedDate = action.payload;

      if (state.selectionPhase === 'idle') {
        return {
          ...state,
          selectedRange: { start: clickedDate, end: null },
          selectionPhase: 'selecting-end',
          hoverDate: null,
        };
      } else if (state.selectionPhase === 'selecting-end') {
        if (state.selectedRange.start && isBefore(clickedDate, state.selectedRange.start)) {
          // Clicking before start — restart selection from new date
          return {
            ...state,
            selectedRange: { start: clickedDate, end: null },
            selectionPhase: 'selecting-end',
            hoverDate: null,
          };
        }
        // Same day click = single-day note
        return {
          ...state,
          selectedRange: { start: state.selectedRange.start, end: clickedDate },
          selectionPhase: 'idle',
          hoverDate: null,
        };
      }
      return state;
    }
    case 'CLEAR_SELECTION':
      return {
        ...state,
        selectedRange: { start: null, end: null },
        selectionPhase: 'idle',
        hoverDate: null,
      };
    case 'GO_TO_TODAY': {
      const now = new Date();
      return {
        ...state,
        currentYear: now.getFullYear(),
        currentMonth: now.getMonth(),
        selectedRange: { start: null, end: null },
        selectionPhase: 'idle',
        hoverDate: null,
      };
    }
    default:
      return state;
  }
}

export function useCalendarState() {
  const [state, dispatch] = useReducer(calendarReducer, initialState);
  return { state, dispatch };
}
