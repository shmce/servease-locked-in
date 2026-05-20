import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildTimeOffEndSlots } from './providerAvailability';

describe('provider availability helpers', () => {
  it('offers the closing hour after the final booking slot as an end time', () => {
    assert.deepEqual(buildTimeOffEndSlots(['13:00', '14:00', '15:00', '16:00']), [
      '13:00',
      '14:00',
      '15:00',
      '16:00',
      '17:00',
    ]);
  });
});
