import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildDateParam, CLICKY_DATE_KEYWORDS } from '../src/date-utils.js';

describe('buildDateParam', () => {
  describe('explicit date range', () => {
    it('returns "start,end" for a valid range', () => {
      assert.equal(
        buildDateParam({ start_date: '2024-01-01', end_date: '2024-01-31' }),
        '2024-01-01,2024-01-31'
      );
    });

    it('accepts same start and end (single day)', () => {
      assert.equal(
        buildDateParam({ start_date: '2024-06-15', end_date: '2024-06-15' }),
        '2024-06-15,2024-06-15'
      );
    });

    it('accepts a 31-day boundary range', () => {
      assert.equal(
        buildDateParam({ start_date: '2024-01-01', end_date: '2024-02-01' }),
        '2024-01-01,2024-02-01'
      );
    });

    it('throws on a 32-day range', () => {
      assert.throws(
        () => buildDateParam({ start_date: '2024-01-01', end_date: '2024-02-02' }),
        /31 days/
      );
    });

    it('throws when start is after end', () => {
      assert.throws(
        () => buildDateParam({ start_date: '2024-03-01', end_date: '2024-01-01' }),
        /on or before/
      );
    });

    it('throws on bad format with slashes', () => {
      assert.throws(
        () => buildDateParam({ start_date: '2024/01/01', end_date: '2024-01-31' }),
        /YYYY-MM-DD/
      );
    });

    it('throws on calendar-invalid date Feb 30', () => {
      assert.throws(
        () => buildDateParam({ start_date: '2024-02-30', end_date: '2024-03-01' }),
        /not a valid calendar date/
      );
    });

    it('throws on Feb 29 in a non-leap year', () => {
      assert.throws(
        () => buildDateParam({ start_date: '2023-02-29', end_date: '2023-03-01' }),
        /not a valid calendar date/
      );
    });

    it('accepts Feb 29 in a leap year', () => {
      assert.equal(
        buildDateParam({ start_date: '2024-02-29', end_date: '2024-02-29' }),
        '2024-02-29,2024-02-29'
      );
    });

    it('throws when only start_date is provided', () => {
      assert.throws(
        () => buildDateParam({ start_date: '2024-01-01' }),
        /Both start_date and end_date are required/
      );
    });

    it('throws when only end_date is provided', () => {
      assert.throws(
        () => buildDateParam({ end_date: '2024-01-01' }),
        /Both start_date and end_date are required/
      );
    });
  });

  describe('relative date_range keyword', () => {
    for (const keyword of CLICKY_DATE_KEYWORDS) {
      it(`accepts "${keyword}"`, () => {
        assert.equal(buildDateParam({ date_range: keyword }), keyword);
      });
    }

    it('throws on an unknown keyword', () => {
      assert.throws(
        () => buildDateParam({ date_range: 'last-3-days' }),
        /Invalid date_range/
      );
    });
  });

  describe('mutual exclusion', () => {
    it('throws when neither explicit nor keyword is provided', () => {
      assert.throws(() => buildDateParam({}), /Provide EITHER/);
    });

    it('throws when both explicit and keyword are provided', () => {
      assert.throws(
        () =>
          buildDateParam({
            start_date: '2024-01-01',
            end_date: '2024-01-02',
            date_range: 'today',
          }),
        /not both/
      );
    });
  });
});
