export const CLICKY_DATE_KEYWORDS = [
  'today',
  'yesterday',
  'last-7-days',
  'last-30-days',
  'this-week',
  'last-week',
  'this-month',
  'last-month',
  'this-year',
  'last-year',
] as const;

export type ClickyDateKeyword = (typeof CLICKY_DATE_KEYWORDS)[number];

export interface DateInput {
  start_date?: string;
  end_date?: string;
  date_range?: string;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function buildDateParam(input: DateInput): string {
  const hasExplicit = Boolean(input.start_date || input.end_date);
  const hasKeyword = Boolean(input.date_range);

  if (hasExplicit && hasKeyword) {
    throw new Error('Provide EITHER start_date+end_date OR date_range, not both');
  }
  if (!hasExplicit && !hasKeyword) {
    throw new Error('Provide EITHER start_date+end_date OR date_range');
  }

  if (hasKeyword) {
    if (!CLICKY_DATE_KEYWORDS.includes(input.date_range as ClickyDateKeyword)) {
      throw new Error(
        `Invalid date_range "${input.date_range}". Must be one of: ${CLICKY_DATE_KEYWORDS.join(', ')}`
      );
    }
    return input.date_range as string;
  }

  if (!input.start_date || !input.end_date) {
    throw new Error('Both start_date and end_date are required when using explicit dates');
  }

  for (const [label, value] of [
    ['start_date', input.start_date],
    ['end_date', input.end_date],
  ] as const) {
    if (!DATE_RE.test(value)) {
      throw new Error(`${label} must be in YYYY-MM-DD format`);
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
      throw new Error(`${label} "${value}" is not a valid calendar date`);
    }
  }

  const start = new Date(input.start_date);
  const end = new Date(input.end_date);
  if (start > end) {
    throw new Error('start_date must be on or before end_date');
  }
  const diffDays = (end.getTime() - start.getTime()) / 86_400_000;
  if (diffDays > 31) {
    throw new Error('Date range cannot exceed 31 days as per Clicky API limits');
  }

  return `${input.start_date},${input.end_date}`;
}
