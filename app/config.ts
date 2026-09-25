'use client';
import { useSyncExternalStore } from 'react';
import calendarData from '@/data/calendar.json';

export const FACEBOOK = 'https://www.facebook.com/FASKKOSOVA';
export const SEASON = calendarData.year;

export type RaceEvent = (typeof calendarData.events)[number];
export const events: RaceEvent[] = [...calendarData.events].sort((a, b) => a.startDate.localeCompare(b.startDate));

export const months = ['Janar', 'Shkurt', 'Mars', 'Prill', 'Maj', 'Qershor', 'Korrik', 'Gusht', 'Shtator', 'Tetor', 'Nëntor', 'Dhjetor'];

export function dayRange(event: RaceEvent) {
  const start = Number(event.startDate.slice(8)), end = Number(event.endDate.slice(8));
  return start === end ? String(start) : `${start}–${end}`;
}
export function monthName(date: string) { return months[Number(date.slice(5, 7)) - 1]; }
export function dateLabel(event: RaceEvent) { return `${dayRange(event)} ${monthName(event.startDate)}`; }

function localIsoDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

const noSubscription = () => () => {};
/** Today's date (YYYY-MM-DD) in the visitor's browser. Null in the static HTML, so past/next markers never go stale after a build. */
export function useToday() {
  return useSyncExternalStore<string | null>(noSubscription, localIsoDate, () => null);
}

export function daysUntil(date: string, today: string) {
  return Math.round((Date.parse(date) - Date.parse(today)) / 86_400_000);
}
