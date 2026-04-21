import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../redux/store';
import {
  changePassword as changePasswordThunk,
  loginUser,
  logout,
  logoutUser,
  registerUser,
  type AuthUser,
} from '../redux/slice/authSlice';
import api from '../api/axiosInstance';

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  isBootstrapping: boolean;
  error: string | null;
  signIn: (payload: { userId: string; password: string }) => Promise<void>;
  signOut: () => void;
  register: (payload: {
    name: string;
    email: string;
    password: string;
    passwordConfirmation: string;
  }) => Promise<void>;
  changePassword: (payload: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, status, error, token, tokenType } = useSelector(
    (state: RootState) => state.auth,
  );

  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    const MIN_SPLASH_DURATION_MS = 3400;
    const timer = setTimeout(() => setIsBootstrapping(false), MIN_SPLASH_DURATION_MS);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common.Authorization = `${tokenType || 'Bearer'} ${token}`;
    } else {
      delete api.defaults.headers.common.Authorization;
    }
  }, [token, tokenType]);

  const signIn = useCallback(
    async (payload: { userId: string; password: string }) => {
      await dispatch(
        loginUser({
          email: payload.userId,
          password: payload.password,
        }),
      ).unwrap();
    },
    [dispatch],
  );

  const register = useCallback(
    async (payload: {
      name: string;
      email: string;
      password: string;
      passwordConfirmation: string;
    }) => {
      setIsRegistering(true);
      try {
        await dispatch(
          registerUser({
            name: payload.name.trim(),
            email: payload.email.trim(),
            password: payload.password,
            password_confirmation: payload.passwordConfirmation,
          }),
        ).unwrap();
      } finally {
        setIsRegistering(false);
      }
    },
    [dispatch],
  );

  const signOut = useCallback(() => {
    dispatch(logoutUser())
      .unwrap()
      .catch(() => {
        dispatch(logout());
      });
  }, [dispatch]);

  const changePassword = useCallback(
    async (payload: {
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    }) => {
      await dispatch(
        changePasswordThunk({
          current_password: payload.currentPassword,
          password: payload.newPassword,
          password_confirmation: payload.confirmPassword,
        }),
      ).unwrap();
    },
    [dispatch],
  );

  const isLoading = isBootstrapping || status === 'loading' || isRegistering;

  const value = useMemo(
    () => ({
      user: user ?? null,
      isLoading,
      isBootstrapping,
      error: error ?? null,
      signIn,
      signOut,
      register,
      changePassword,
    }),
    [user, isLoading, isBootstrapping, error, signIn, signOut, register, changePassword],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

