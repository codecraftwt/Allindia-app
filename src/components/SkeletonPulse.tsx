import React, { useMemo, useEffect } from 'react';
import { Animated, ViewStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface SkeletonPulseProps {
  style: ViewStyle | ViewStyle[];
}

const SkeletonPulse: React.FC<SkeletonPulseProps> = ({ style }) => {
  const opacity = useMemo(() => new Animated.Value(0.3), []);
  const { colors } = useTheme();

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    animation.start();
    
    return () => animation.stop();
  }, [opacity]);

  return <Animated.View style={[style, { backgroundColor: colors.border, opacity }]} />;
};

export default SkeletonPulse;
