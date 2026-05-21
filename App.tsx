import React, { useEffect, useRef } from 'react';
import { NavigationContainer, DefaultTheme, createNavigationContainerRef } from '@react-navigation/native';
import { StatusBar, View, StyleSheet, Dimensions } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor, RootState } from './src/redux/store';
import AuthNavigator from './src/navigation/AuthNavigator';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { ToastProvider } from './src/context/ToastContext';
import { AnimatedBackground } from './src/components/AnimatedBackground';

export const navigationRef = createNavigationContainerRef();

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <SafeAreaProvider>
            <ThemeProvider>
              <ToastProvider>
                <AppNavigation />
              </ToastProvider>
            </ThemeProvider>
          </SafeAreaProvider>
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  );
}

const linking = {
  prefixes: [
    'jobindia://',
    'https://jobindia.ai',
    'https://*.jobindia.ai',
    'http://*.ngrok-free.app',
    'https://*.ngrok-free.app',
  ],
  config: {
    screens: {
      ForgotPass: 'reset-password',
    },
  },
};

function AppNavigation() {
  const { colors, mode, isThemeLoading } = useTheme();
  const { isLoggedIn } = useSelector((state: RootState) => state.auth);
  const wasLoggedIn = useRef(isLoggedIn);

  useEffect(() => {
    if (wasLoggedIn.current && !isLoggedIn) {
      if (navigationRef.isReady()) {
        navigationRef.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    }
    wasLoggedIn.current = isLoggedIn;
  }, [isLoggedIn]);

  const navTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: colors.background,
      card: colors.surface,
      text: colors.textPrimary,
      border: colors.border,
      primary: colors.primary,
    },
  };

  if (isThemeLoading) {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <AnimatedBackground colors={colors} />

      <NavigationContainer ref={navigationRef} theme={navTheme} linking={linking}>
        <StatusBar
          barStyle={mode === 'dark' ? 'light-content' : 'dark-content'}
          backgroundColor="transparent"
          translucent={true}
        />
        <AuthNavigator />
      </NavigationContainer>
    </View>
  );
}

export default App;
