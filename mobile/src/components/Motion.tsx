import { ReactNode, useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  ViewProps,
  ViewStyle,
} from 'react-native';

export type RouteTransitionVariant =
  | 'backward'
  | 'forward'
  | 'modal'
  | 'neutral'
  | 'sheet'
  | 'tab';

export type EntranceMotionVariant =
  | 'card'
  | 'content'
  | 'listItem'
  | 'loading'
  | 'none'
  | 'sheet'
  | 'success';

type RouteTransitionConfig = {
  duration: number;
  easing: (value: number) => number;
  opacityFrom: number;
  scaleFrom: number;
  translateX: number;
  translateY: number;
};

type EntranceMotionOptions = {
  delay?: number;
  disabled?: boolean;
  duration?: number;
  motionKey?: number | string;
  offset?: number;
  variant?: EntranceMotionVariant;
};

type MotionViewProps = ViewProps & {
  children: ReactNode;
  delay?: number;
  disabled?: boolean;
  index?: number;
  motionKey?: number | string;
  style?: StyleProp<ViewStyle>;
  variant?: EntranceMotionVariant;
};

type ContentTransitionProps = ViewProps & {
  children: ReactNode;
  contentKey: number | string;
  style?: StyleProp<ViewStyle>;
};

type MotionPressableProps = Omit<PressableProps, 'children'> & {
  children: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  feedback?: 'none' | 'scale';
  selected?: boolean;
};

const reducedMotionListeners = new Set<(enabled: boolean) => void>();
let reducedMotionSnapshot = false;
let reducedMotionSubscription: { remove: () => void } | null = null;

export const motionTokens = {
  duration: {
    instant: 1,
    micro: 120,
    press: 110,
    reduced: 80,
    route: 240,
    short: 180,
    standard: 260,
    success: 340,
    shimmer: 850,
  },
  easing: {
    decelerate: Easing.out(Easing.cubic),
    emphasize: Easing.bezier(0.2, 0, 0, 1),
    standard: Easing.out(Easing.cubic),
  },
  offset: {
    card: 10,
    content: 12,
    listItem: 8,
    loading: 4,
    route: 16,
    sheet: 26,
    success: 6,
  },
  scale: {
    press: 0.97,
    selected: 1.08,
    successPeak: 1.04,
  },
  spring: {
    press: {
      damping: 18,
      mass: 0.7,
      stiffness: 260,
    },
    selected: {
      damping: 16,
      mass: 0.7,
      stiffness: 240,
    },
  },
  stagger: {
    item: 36,
    maxDelay: 144,
  },
} as const;

export function resolveMotionDuration(duration: number, reduceMotion = false) {
  return reduceMotion
    ? Math.min(duration, motionTokens.duration.reduced)
    : duration;
}

export function resolveStaggerDelay(index = 0, reduceMotion = false) {
  if (reduceMotion) {
    return 0;
  }

  return Math.min(
    Math.max(0, index) * motionTokens.stagger.item,
    motionTokens.stagger.maxDelay,
  );
}

export function resolveRouteTransitionConfig(
  variant: RouteTransitionVariant = 'neutral',
  reduceMotion = false,
): RouteTransitionConfig {
  if (reduceMotion) {
    return {
      duration: motionTokens.duration.reduced,
      easing: motionTokens.easing.standard,
      opacityFrom: 0.94,
      scaleFrom: 1,
      translateX: 0,
      translateY: 0,
    };
  }

  const base = {
    duration: motionTokens.duration.route,
    easing: motionTokens.easing.emphasize,
    opacityFrom: 0.92,
    scaleFrom: 1,
    translateX: 0,
    translateY: motionTokens.offset.route,
  };

  switch (variant) {
    case 'backward':
      return {
        ...base,
        translateX: -motionTokens.offset.route,
        translateY: 0,
      };
    case 'forward':
      return {
        ...base,
        translateX: motionTokens.offset.route,
        translateY: 0,
      };
    case 'modal':
    case 'sheet':
      return {
        ...base,
        duration: motionTokens.duration.standard,
        opacityFrom: 0.9,
        translateY: motionTokens.offset.sheet,
      };
    case 'tab':
      return {
        ...base,
        duration: motionTokens.duration.short,
        translateY: motionTokens.offset.listItem,
      };
    case 'neutral':
    default:
      return base;
  }
}

export function ScreenTransition({
  routeKey,
  children,
  style,
  variant = 'neutral',
}: {
  routeKey: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: RouteTransitionVariant;
}) {
  const reduceMotion = useReducedMotion();
  const progress = useRef(new Animated.Value(1)).current;
  const config = resolveRouteTransitionConfig(variant, reduceMotion);

  useEffect(() => {
    progress.stopAnimation();
    progress.setValue(0);

    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: config.duration,
      easing: config.easing,
      useNativeDriver: true,
    });

    animation.start();
    return () => animation.stop();
  }, [config.duration, config.easing, progress, routeKey]);

  return (
    <Animated.View
      style={[
        styles.screen,
        style,
        {
          opacity: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [config.opacityFrom, 1],
          }),
          transform: [
            {
              translateX: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [config.translateX, 0],
              }),
            },
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [config.translateY, 0],
              }),
            },
            {
              scale: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [config.scaleFrom, 1],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

export function MotionView({
  children,
  delay = 0,
  disabled,
  index = 0,
  motionKey,
  style,
  variant = 'content',
  ...viewProps
}: MotionViewProps) {
  const reduceMotion = useReducedMotion();
  const entranceStyle = useEntranceMotion({
    delay: delay + resolveStaggerDelay(index, reduceMotion),
    disabled,
    motionKey,
    variant,
    offset: offsetForEntranceVariant(variant),
  });

  return (
    <Animated.View
      {...viewProps}
      style={[
        style,
        entranceStyle,
      ]}
    >
      {children}
    </Animated.View>
  );
}

export function StaggeredMotionView({
  children,
  delay = 0,
  disabled,
  index = 0,
  motionKey,
  style,
  variant = 'listItem',
  ...viewProps
}: MotionViewProps) {
  const reduceMotion = useReducedMotion();
  const entranceStyle = useEntranceMotion({
    delay: delay + resolveStaggerDelay(index, reduceMotion),
    disabled,
    motionKey,
    variant,
    offset: offsetForEntranceVariant(variant),
  });

  return (
    <Animated.View
      {...viewProps}
      style={[
        style,
        entranceStyle,
      ]}
    >
      {children}
    </Animated.View>
  );
}

export function ContentTransition({
  children,
  contentKey,
  style,
  ...viewProps
}: ContentTransitionProps) {
  return (
    <MotionView
      {...viewProps}
      motionKey={contentKey}
      style={style}
      variant="loading"
    >
      {children}
    </MotionView>
  );
}

export function SuccessMotion({
  active = true,
  children,
  style,
  ...viewProps
}: ViewProps & {
  active?: boolean;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const successStyle = useSuccessMotion(active);

  return (
    <Animated.View
      {...viewProps}
      style={[
        style,
        successStyle,
      ]}
    >
      {children}
    </Animated.View>
  );
}

export function MotionPressable({
  children,
  contentStyle,
  disabled,
  feedback = 'scale',
  onPressIn,
  onPressOut,
  selected,
  ...pressableProps
}: MotionPressableProps) {
  const isDisabled = Boolean(disabled);
  const press = usePressScale(isDisabled || feedback === 'none');
  const selectedMotion = useSelectedMotion(Boolean(selected), isDisabled);

  return (
    <Pressable
      {...pressableProps}
      disabled={isDisabled}
      onPressIn={(event) => {
        press.onPressIn();
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        press.onPressOut();
        onPressOut?.(event);
      }}
    >
      <Animated.View style={selectedMotion.animatedStyle}>
        <Animated.View style={[contentStyle, press.animatedStyle]}>
          {children}
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

export function useReducedMotion() {
  const [reduceMotion, setReduceMotion] = useState(reducedMotionSnapshot);

  useEffect(() => {
    ensureReducedMotionSubscription();
    setReduceMotion(reducedMotionSnapshot);
    reducedMotionListeners.add(setReduceMotion);

    return () => {
      reducedMotionListeners.delete(setReduceMotion);
    };
  }, []);

  return reduceMotion;
}

export function useEntranceMotion(options: EntranceMotionOptions | number = {}) {
  const resolvedOptions =
    typeof options === 'number' ? { offset: options } : options;
  const {
    delay = 0,
    disabled = false,
    duration = motionTokens.duration.standard,
    motionKey,
    offset = motionTokens.offset.content,
    variant = 'content',
  } = resolvedOptions;
  const reduceMotion = useReducedMotion();
  const progress = useRef(new Animated.Value(0)).current;
  const enabled = !disabled && variant !== 'none';

  useEffect(() => {
    progress.stopAnimation();

    if (!enabled || reduceMotion) {
      progress.setValue(1);
      return undefined;
    }

    progress.setValue(0);

    const animation = Animated.timing(progress, {
      toValue: 1,
      delay,
      duration: resolveMotionDuration(duration, reduceMotion),
      easing: motionTokens.easing.standard,
      useNativeDriver: true,
    });

    animation.start();
    return () => animation.stop();
  }, [
    delay,
    duration,
    enabled,
    motionKey,
    progress,
    reduceMotion,
  ]);

  return {
    opacity: progress,
    transform: [
      {
        translateY: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [reduceMotion ? 0 : offset, 0],
        }),
      },
    ],
  };
}

export function usePressScale(disabled?: boolean) {
  const reduceMotion = useReducedMotion();
  const scale = useRef(new Animated.Value(1)).current;
  const isDisabled = Boolean(disabled || reduceMotion);

  useEffect(() => {
    if (isDisabled) {
      scale.stopAnimation();
      scale.setValue(1);
    }
  }, [isDisabled, scale]);

  function animate(toValue: number) {
    if (isDisabled) {
      return;
    }

    Animated.spring(scale, {
      toValue,
      ...motionTokens.spring.press,
      useNativeDriver: true,
    }).start();
  }

  return {
    animatedStyle: {
      transform: [{ scale }],
    },
    scale,
    onPressIn: () => animate(motionTokens.scale.press),
    onPressOut: () => animate(1),
  };
}

export function useSelectedMotion(selected: boolean, disabled?: boolean) {
  const reduceMotion = useReducedMotion();
  const progress = useRef(new Animated.Value(selected ? 1 : 0)).current;
  const isDisabled = Boolean(disabled || reduceMotion);

  useEffect(() => {
    progress.stopAnimation();

    if (isDisabled) {
      progress.setValue(selected ? 1 : 0);
      return undefined;
    }

    const animation = Animated.spring(progress, {
      toValue: selected ? 1 : 0,
      ...motionTokens.spring.selected,
      useNativeDriver: true,
    });

    animation.start();
    return () => animation.stop();
  }, [isDisabled, progress, selected]);

  return {
    animatedStyle: {
      transform: [
        {
          scale: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [1, motionTokens.scale.selected],
          }),
        },
      ],
    },
    progress,
  };
}

export function useSuccessMotion(active = true) {
  const reduceMotion = useReducedMotion();
  const progress = useRef(new Animated.Value(active ? 0 : 1)).current;

  useEffect(() => {
    progress.stopAnimation();

    if (!active || reduceMotion) {
      progress.setValue(1);
      return undefined;
    }

    progress.setValue(0);

    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: motionTokens.duration.success,
      easing: motionTokens.easing.emphasize,
      useNativeDriver: true,
    });

    animation.start();
    return () => animation.stop();
  }, [active, progress, reduceMotion]);

  return {
    opacity: progress.interpolate({
      inputRange: [0, 0.25, 1],
      outputRange: [0, 1, 1],
    }),
    transform: [
      {
        translateY: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [reduceMotion ? 0 : motionTokens.offset.success, 0],
        }),
      },
      {
        scale: progress.interpolate({
          inputRange: [0, 0.7, 1],
          outputRange: [1, motionTokens.scale.successPeak, 1],
        }),
      },
    ],
  };
}

export function useSkeletonPulseOpacity() {
  const opacity = useRef(new Animated.Value(0.58)).current;
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    opacity.stopAnimation();

    if (reduceMotion) {
      opacity.setValue(0.72);
      return undefined;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          duration: motionTokens.duration.shimmer,
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          duration: motionTokens.duration.shimmer,
          toValue: 0.58,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [opacity, reduceMotion]);

  return opacity;
}

function offsetForEntranceVariant(variant: EntranceMotionVariant) {
  switch (variant) {
    case 'card':
      return motionTokens.offset.card;
    case 'listItem':
      return motionTokens.offset.listItem;
    case 'loading':
      return motionTokens.offset.loading;
    case 'sheet':
      return motionTokens.offset.sheet;
    case 'success':
      return motionTokens.offset.success;
    case 'none':
      return 0;
    case 'content':
    default:
      return motionTokens.offset.content;
  }
}

function ensureReducedMotionSubscription() {
  if (reducedMotionSubscription) {
    return;
  }

  AccessibilityInfo.isReduceMotionEnabled()
    .then(setReducedMotionSnapshot)
    .catch(() => undefined);

  reducedMotionSubscription = AccessibilityInfo.addEventListener(
    'reduceMotionChanged',
    setReducedMotionSnapshot,
  );
}

function setReducedMotionSnapshot(enabled: boolean) {
  reducedMotionSnapshot = enabled;
  for (const listener of reducedMotionListeners) {
    listener(enabled);
  }
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
});
