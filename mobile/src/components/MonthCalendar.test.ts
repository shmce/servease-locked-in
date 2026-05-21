import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import test from 'node:test';

test('month calendar component owns the shared month grid behavior', () => {
  const source = readFileSync(
    join(process.cwd(), 'src/components/MonthCalendar.tsx'),
    'utf8',
  );

  assert.match(source, /export type MonthCalendarMarkerKind/);
  assert.match(source, /export function MonthCalendar/);
  assert.match(source, /selectedDate/);
  assert.match(source, /minDate/);
  assert.match(source, /maxDate/);
  assert.match(source, /disabledDates/);
  assert.match(source, /markers/);
  assert.match(source, /accessibilityLabel=\{`Select \$\{date\}`\}/);
  assert.match(source, /disabled=\{isDisabled\}/);
  assert.match(source, /onSelectDate\(date\)/);
  assert.match(source, /Previous month/);
  assert.match(source, /Next month/);
});

test('month calendar pure cell builder respects range and explicit disabled dates', async () => {
  const { buildMonthCalendarCells } = await import('./MonthCalendarModel');
  const cells = buildMonthCalendarCells('2026-05', {
    minDate: '2026-05-03',
    maxDate: '2026-05-30',
    disabledDates: new Set(['2026-05-20']),
  });

  assert.equal(cells.filter((cell) => cell.date).length, 31);
  assert.equal(cells.find((cell) => cell.date === '2026-05-02')?.isDisabled, true);
  assert.equal(cells.find((cell) => cell.date === '2026-05-20')?.isDisabled, true);
  assert.equal(cells.find((cell) => cell.date === '2026-05-31')?.isDisabled, true);
  assert.equal(cells.find((cell) => cell.date === '2026-05-21')?.isDisabled, false);
});

test('month calendar rows always preserve the saturday column', async () => {
  const { buildMonthCalendarCells, buildMonthCalendarRows } = await import(
    './MonthCalendarModel'
  );
  const rows = buildMonthCalendarRows(buildMonthCalendarCells('2026-05'));

  assert.ok(rows.length > 0);
  assert.equal(rows.every((row) => row.length === 7), true);
  assert.deepEqual(
    rows.map((row) => row[6].date).filter(Boolean),
    ['2026-05-02', '2026-05-09', '2026-05-16', '2026-05-23', '2026-05-30'],
  );
});
