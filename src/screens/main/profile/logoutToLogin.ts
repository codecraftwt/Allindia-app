import { CommonActions } from '@react-navigation/native';

/**
 * Resets the root auth stack to Login. Call from screens inside Main → Profile stack.
 */
export function logoutToLogin(navigation: { getParent: () => unknown }): void {
  const tabNav = navigation.getParent() as { getParent?: () => { dispatch: (a: unknown) => void } } | null;
  const authNav = tabNav?.getParent?.();
  if (authNav) {
    authNav.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      }),
    );
  }
}
