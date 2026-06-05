import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  resolveMobileContentLoadState,
  resolveSelectedEntityState,
  shouldShowGlobalBusyPill,
} from './mobileLoading';

describe('mobile loading state helpers', () => {
  it('distinguishes initial loading, refreshing, empty, and ready content', () => {
    assert.equal(
      resolveMobileContentLoadState({ hasContent: false, isLoading: true }),
      'initial',
    );
    assert.equal(
      resolveMobileContentLoadState({ hasContent: true, isLoading: true }),
      'refreshing',
    );
    assert.equal(
      resolveMobileContentLoadState({ hasContent: false, isLoading: false }),
      'resolved-empty',
    );
    assert.equal(
      resolveMobileContentLoadState({ hasContent: true, isLoading: false }),
      'ready',
    );
  });

  it('distinguishes selected entity loading from genuinely missing data', () => {
    assert.equal(
      resolveSelectedEntityState({
        entity: null,
        hasLoaded: false,
        selectedId: 'booking-1',
      }),
      'loading',
    );
    assert.equal(
      resolveSelectedEntityState({
        entity: null,
        hasLoaded: true,
        selectedId: 'booking-1',
      }),
      'missing',
    );
    assert.equal(
      resolveSelectedEntityState({
        entity: { id: 'booking-1' },
        hasLoaded: true,
        selectedId: 'booking-1',
      }),
      'ready',
    );
  });

  it('does not use a global busy pill for ordinary async actions', () => {
    assert.equal(shouldShowGlobalBusyPill(null), false);
    assert.equal(shouldShowGlobalBusyPill('refresh'), false);
    assert.equal(shouldShowGlobalBusyPill('payment'), false);
    assert.equal(shouldShowGlobalBusyPill('create-booking'), false);
  });
});
