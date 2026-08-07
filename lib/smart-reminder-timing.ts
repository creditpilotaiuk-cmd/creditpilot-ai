export type SmartReminderPattern = {
  kind: "MONTH_END" | "MONTHLY_DATE" | "WEEKDAY";
  label: string;
  description: string;
  confidence: number;
  timing: "DAY_BEFORE" | "EXPECTED_DAY" | null;
  stage: -11 | -10;
};

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function dominant(values: number[]) {
  const counts = new Map<number, number>();
  for (const value of values) counts.set(value, (counts.get(value) || 0) + 1);
  const result = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  return result ? { value: result[0], count: result[1], confidence: result[1] / values.length } : null;
}

function daysUntilMonthlyDate(now: Date, day: number) {
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  for (let monthOffset = 0; monthOffset <= 1; monthOffset += 1) {
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth() + monthOffset;
    const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const candidate = Date.UTC(year, month, Math.min(day, lastDay));
    if (candidate >= today) return Math.round((candidate - today) / 86400000);
  }
  return null;
}

export function detectSmartReminderPattern(paidDates: Date[], now = new Date()): SmartReminderPattern | null {
  const dates = paidDates.filter((date) => !Number.isNaN(date.getTime())).sort((a, b) => b.getTime() - a.getTime()).slice(0, 12);
  if (dates.length < 3) return null;

  const monthEndDates = dates.filter((date) => date.getUTCDate() <= 5);
  if (monthEndDates.length / dates.length >= 0.6) {
    const expectedDay = Math.round(monthEndDates.reduce((sum, date) => sum + date.getUTCDate(), 0) / monthEndDates.length);
    const daysUntil = daysUntilMonthlyDate(now, expectedDay);
    const timing = daysUntil === 1 ? "DAY_BEFORE" : daysUntil === 0 ? "EXPECTED_DAY" : null;
    return {
      kind: "MONTH_END",
      label: `Usually pays just after month end (around day ${expectedDay})`,
      description: `${monthEndDates.length} of the last ${dates.length} payments were recorded within five days after month end.`,
      confidence: monthEndDates.length / dates.length,
      timing,
      stage: timing === "EXPECTED_DAY" ? -11 : -10,
    };
  }

  const datePattern = dominant(dates.map((date) => date.getUTCDate()));
  if (datePattern && datePattern.confidence >= 0.6) {
    const daysUntil = daysUntilMonthlyDate(now, datePattern.value);
    const timing = daysUntil === 1 ? "DAY_BEFORE" : daysUntil === 0 ? "EXPECTED_DAY" : null;
    return {
      kind: "MONTHLY_DATE",
      label: `Usually pays on day ${datePattern.value} of the month`,
      description: `${datePattern.count} of the last ${dates.length} payments were recorded on this calendar date.`,
      confidence: datePattern.confidence,
      timing,
      stage: timing === "EXPECTED_DAY" ? -11 : -10,
    };
  }

  const weekdayPattern = dominant(dates.map((date) => date.getUTCDay()));
  if (weekdayPattern && weekdayPattern.confidence >= 0.6) {
    const today = now.getUTCDay();
    const daysUntil = (weekdayPattern.value - today + 7) % 7;
    const timing = daysUntil === 1 ? "DAY_BEFORE" : daysUntil === 0 ? "EXPECTED_DAY" : null;
    return {
      kind: "WEEKDAY",
      label: `Usually pays on ${WEEKDAYS[weekdayPattern.value]}`,
      description: `${weekdayPattern.count} of the last ${dates.length} payments were recorded on this weekday.`,
      confidence: weekdayPattern.confidence,
      timing,
      stage: timing === "EXPECTED_DAY" ? -11 : -10,
    };
  }

  return null;
}
