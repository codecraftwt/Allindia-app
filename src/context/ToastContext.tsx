import React, { createContext, useContext, useState, useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useTheme } from './ThemeContext';
import { spacing } from '../theme/spacing';
import { radius } from '../theme/radius';
import { typography } from '../theme/typography';

type ToastType = 'success' | 'error' | 'info';

interface ToastContextData {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextData>({} as ToastContextData);

export const useToast = () => useContext(ToastContext);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [toast, setToast] = useState<{ visible: boolean; message: string; type: ToastType }>({
    visible: false,
    message: '',
    type: 'success',
  });

  // Track if toast UI is actively shown (controls pointerEvents)
  const [isActive, setIsActive] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toastX = useSharedValue(150);
  const toastOpacity = useSharedValue(0);
  const progress = useSharedValue(0);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    // Clear any existing hide timer
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }

    setToast({ visible: true, message, type });
    setIsActive(true);

    // Slide in from right
    toastX.value = 150;
    toastOpacity.value = 0;
    toastX.value = withTiming(0, { duration: 400, easing: Easing.out(Easing.quad) });
    toastOpacity.value = withTiming(1, { duration: 300 });

    // Progress bar: 1 → 0 over 2.5s
    progress.value = 1;
    progress.value = withTiming(0, { duration: 2500, easing: Easing.linear });

    // Slide out after 2.5s
    hideTimerRef.current = setTimeout(() => {
      toastX.value = withTiming(150, { duration: 400 });
      toastOpacity.value = withTiming(0, { duration: 400 });

      // Deactivate after animation completes so touches pass through
      setTimeout(() => {
        setIsActive(false);
        setToast(prev => ({ ...prev, visible: false }));
      }, 420);
    }, 2500);
  }, [toastX, toastOpacity, progress]);

  const animatedToastStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: toastX.value }],
    opacity: toastOpacity.value,
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/*
        KEY FIX: pointerEvents="none" when toast is not active.
        This ensures the absolute-positioned toast never blocks
        touches on Modals or dropdowns underneath it.
      */}
      <Animated.View
        pointerEvents={isActive ? 'box-none' : 'none'}
        style={[
          styles.toastContainer,
          animatedToastStyle,
          {
            top: insets.top + spacing.sm,
            backgroundColor:
              toast.type === 'success'
                ? colors.success
                : toast.type === 'error'
                ? colors.error
                : colors.primary,
          },
        ]}
      >
        <View style={styles.toastContent}>
          <Icon
            name={
              toast.type === 'success'
                ? 'check-circle'
                : toast.type === 'error'
                ? 'exclamation-circle'
                : 'info-circle'
            }
            size={18}
            color="#FFFFFF"
          />
          <Text
            style={[
              typography.labelMedium,
              { color: '#FFFFFF', marginLeft: spacing.sm, flexShrink: 1 },
            ]}
          >
            {toast.message}
          </Text>
        </View>

        {/* Animated timer bar */}
        <View style={styles.progressBarBg}>
          <Animated.View style={[styles.progressBar, progressStyle]} />
        </View>
      </Animated.View>
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 999999,
    borderRadius: radius.xl,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  progressBarBg: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: '100%',
    position: 'absolute',
    bottom: 0,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    opacity: 0.8,
  },
});
