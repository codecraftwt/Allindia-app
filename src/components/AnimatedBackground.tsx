import React from 'react';
import { View, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { ThemeColors } from '../theme/colors';

const { width, height } = Dimensions.get('window');

export const AnimatedBackground = ({ colors }: { colors: ThemeColors }) => {
  const anims = React.useRef([...Array(5)].map(() => ({
    x: new Animated.Value(Math.random() * width),
    y: new Animated.Value(Math.random() * height),
    scale: new Animated.Value(Math.random() * 0.5 + 0.5),
  }))).current;

  React.useEffect(() => {
    anims.forEach((anim, i) => {
      const duration = 10000 + i * 2000;

      const moveX = () => {
        Animated.sequence([
          Animated.timing(anim.x, { toValue: Math.random() * width, duration, useNativeDriver: true, easing: Easing.linear }),
          Animated.timing(anim.x, { toValue: Math.random() * width, duration, useNativeDriver: true, easing: Easing.linear }),
        ]).start(moveX);
      };

      const moveY = () => {
        Animated.sequence([
          Animated.timing(anim.y, { toValue: Math.random() * height, duration: duration * 1.5, useNativeDriver: true, easing: Easing.linear }),
          Animated.timing(anim.y, { toValue: Math.random() * height, duration: duration * 1.5, useNativeDriver: true, easing: Easing.linear }),
        ]).start(moveY);
      };

      moveX();
      moveY();
    });
  }, []);

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: -1, backgroundColor: colors.background }]}>
      {anims.map((anim, i) => (
        <Animated.View
          key={i}
          style={[
            styles.bubble,
            {
              backgroundColor: colors.primary + (i % 2 === 0 ? '08' : '04'),
              width: 150 + i * 50,
              height: 150 + i * 50,
              borderRadius: (150 + i * 50) / 2,
              transform: [
                { translateX: anim.x },
                { translateY: anim.y },
                { scale: anim.scale }
              ]
            }
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  bubble: {
    position: 'absolute',
    opacity: 0.5,
  },
});
