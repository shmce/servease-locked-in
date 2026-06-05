import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import test from 'node:test';

function readSource(path: string): string {
  return readFileSync(join(process.cwd(), path), 'utf8');
}

test('motion route variants include reduced-motion and directional fallbacks', () => {
  const source = readSource('src/components/Motion.tsx');

  assert.match(source, /type RouteTransitionConfig/);
  assert.match(source, /export function resolveRouteTransitionConfig/);
  assert.match(source, /if \(reduceMotion\)/);
  assert.match(source, /opacityFrom: 0\.94/);
  assert.match(source, /translateX: 0/);
  assert.match(source, /translateY: 0/);
  assert.match(source, /case 'backward'/);
  assert.match(source, /case 'forward'/);
  assert.match(source, /case 'modal'/);
  assert.match(source, /case 'sheet'/);
  assert.match(source, /case 'tab'/);
  assert.match(source, /variant = 'neutral'/);
});

test('motion press feedback is disabled-safe and selected-state aware', () => {
  const source = readSource('src/components/Motion.tsx');
  const pressableStart = source.indexOf('export function MotionPressable');
  const pressableEnd = source.indexOf('export function useReducedMotion');
  const pressableSource = source.slice(pressableStart, pressableEnd);

  assert.match(pressableSource, /const isDisabled = Boolean\(disabled\)/);
  assert.match(pressableSource, /usePressScale\(isDisabled \|\| feedback === 'none'\)/);
  assert.match(pressableSource, /useSelectedMotion\(Boolean\(selected\), isDisabled\)/);
  assert.match(pressableSource, /disabled=\{isDisabled\}/);
  assert.match(source, /scale\.setValue\(1\)/);
  assert.match(source, /if \(isDisabled\) \{/);
});

test('loading and content replacement use shared motion instead of abrupt swaps', () => {
  const motionSource = readSource('src/components/Motion.tsx');
  const loadingSource = readSource('src/shared/components/LoadingStates.tsx');
  const designKitSource = readSource('src/components/DesignKit.tsx');

  assert.match(motionSource, /export function ContentTransition/);
  assert.match(motionSource, /contentKey/);
  assert.match(motionSource, /variant="loading"/);
  assert.match(motionSource, /export function useSkeletonPulseOpacity/);
  assert.match(motionSource, /opacity\.setValue\(0\.72\)/);
  assert.match(motionSource, /Animated\.loop/);
  assert.match(motionSource, /useNativeDriver: true/);
  assert.match(loadingSource, /variant="loading"/);
  assert.match(loadingSource, /StaggeredMotionView/);
  assert.match(designKitSource, /useSkeletonPulseOpacity/);
});
