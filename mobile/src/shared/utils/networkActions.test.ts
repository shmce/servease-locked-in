import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  clearNetworkActionGuards,
  isNetworkActionPending,
  runExclusiveNetworkAction,
} from './networkActions';

describe('networkActions', () => {
  it('allows one network action for a key at a time', async () => {
    clearNetworkActionGuards();
    let resolveFirstAction: ((value: string) => void) | null = null;
    const firstAction = runExclusiveNetworkAction(
      'booking:create',
      () =>
        new Promise<string>((resolve) => {
          resolveFirstAction = resolve;
        }),
    );

    assert.equal(isNetworkActionPending('booking:create'), true);

    const duplicate = await runExclusiveNetworkAction(
      'booking:create',
      async () => 'should-not-run',
      {
        onDuplicate: () => 'duplicate-blocked',
      },
    );

    const finishFirstAction = resolveFirstAction as
      | ((value: string) => void)
      | null;
    if (!finishFirstAction) {
      throw new Error('Expected first action resolver to be set.');
    }
    finishFirstAction('created');
    const first = await firstAction;

    assert.equal(first, 'created');
    assert.equal(duplicate, 'duplicate-blocked');
    assert.equal(isNetworkActionPending('booking:create'), false);
    clearNetworkActionGuards();
  });

  it('clears pending action state when the action fails', async () => {
    clearNetworkActionGuards();

    await assert.rejects(
      runExclusiveNetworkAction('booking:update', async () => {
        throw new Error('Transition failed');
      }),
      /Transition failed/,
    );

    assert.equal(isNetworkActionPending('booking:update'), false);
    clearNetworkActionGuards();
  });
});
