import { ReactNode, useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from 'react-native';

export function ScreenTransition({
  routeKey,
  children,
  style,
}: {
  routeKey: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const progress = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [progress, routeKey]);

  return (
    <Animated.View
      style={[
        styles.screen,
        style,
        {
          opacity: progress,
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [14, 0],
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

export function useEntranceMotion(offset = 10) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [progress]);

  return {
    opacity: progress,
    transform: [
      {
        translateY: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [offset, 0],
        }),
      },
    ],
  };
}

export function usePressScale(disabled?: boolean) {
  const scale = useRef(new Animated.Value(1)).current;

  function animate(toValue: number) {
    if (disabled) {
      return;
    }

    Animated.spring(scale, {
      toValue,
      damping: 18,
      mass: 0.7,
      stiffness: 260,
      useNativeDriver: true,
    }).start();
  }

  return {
    scale,
    onPressIn: () => animate(0.97),
    onPressOut: () => animate(1),
  };
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
});
