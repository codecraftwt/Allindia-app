import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle, Dimensions, StyleProp } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../context/ThemeContext';

interface SkeletonPulseProps {
  style?: StyleProp<ViewStyle>;
  borderRadius?: number;
  baseColor?: string;
  highlightColor?: string;
  children?: React.ReactNode;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SkeletonPulse: React.FC<SkeletonPulseProps> = ({
  style,
  borderRadius,
  baseColor: customBase,
  highlightColor: customHighlight,
  children,
}) => {
  const { mode } = useTheme();
  const isDark = mode === 'dark';
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1400,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCREEN_WIDTH, SCREEN_WIDTH],
  });

  const defaultBase = isDark ? 'rgba(255, 255, 255, 0.07)' : '#E8EEF5';
  const defaultHighlight = isDark ? 'rgba(255, 255, 255, 0.18)' : '#FFFFFF';

  const baseColor = customBase || defaultBase;
  const highlightColor = customHighlight || defaultHighlight;

  return (
    <View
      style={[
        {
          backgroundColor: baseColor,
          overflow: 'hidden',
          borderRadius: borderRadius ?? 6,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <LinearGradient
          colors={['transparent', highlightColor, 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{ width: SCREEN_WIDTH, height: '100%' }}
        />
      </Animated.View>
      {children}
    </View>
  );
};

export default SkeletonPulse;
