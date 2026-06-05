import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  isProviderServiceStartWindowOpen,
  providerServiceStartWindowMinutes,
} from './providerStartWindow';

describe('provider service start window', () => {
  it('opens thirty minutes before the scheduled start and stays open after', () => {
    assert.equal(providerServiceStartWindowMinutes, 30);
    assert.equal(
      isProviderServiceStartWindowOpen(
        '2026-07-20T08:00:00.000Z',
        new Date('2026-07-20T07:29:00.000Z'),
      ),
      false,
    );
    assert.equal(
      isProviderServiceStartWindowOpen(
        '2026-07-20T08:00:00.000Z',
        new Date('2026-07-20T07:30:00.000Z'),
      ),
      true,
    );
    assert.equal(
      isProviderServiceStartWindowOpen(
        '2026-07-20T08:00:00.000Z',
        new Date('2026-07-20T09:00:00.000Z'),
      ),
      true,
    );
  });
});
