import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { ThemeColors, radius, spacing } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const SettingsScreen = () => {
  const { signOut } = useAuth();
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.root}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity style={styles.row}>
            <Icon name="help-circle-outline" size={20} color={colors.primary} />
            <Text style={styles.rowText}>Help &amp; Support</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.row}>
            <Icon name="document-text-outline" size={20} color={colors.primary} />
            <Text style={styles.rowText}>Terms &amp; Privacy</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Icon name="log-out-outline" size={20} color={colors.surface} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    root: {
      flex: 1,
      padding: spacing.lg,
      gap: spacing.lg,
    },
    section: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.lg,
      gap: spacing.md,
      shadowColor: 'rgba(16, 36, 84, 0.06)',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
      elevation: 6,
    },
    sectionTitle: {
      fontSize: 18,
      color: colors.textPrimary,
      fontFamily: 'Poppins-SemiBold',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    rowText: {
      fontSize: 15,
      color: colors.textPrimary,
      fontFamily: 'Poppins-Regular',
    },
    signOutButton: {
      height: 52,
      borderRadius: radius.md,
      backgroundColor: colors.accent,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      shadowColor: 'rgba(230, 57, 70, 0.3)',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 18,
      elevation: 8,
    },
    signOutText: {
      fontSize: 16,
      color: colors.surface,
      fontFamily: 'Poppins-SemiBold',
    },
  });

export default SettingsScreen;

