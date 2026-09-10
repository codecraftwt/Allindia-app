import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { ThemeColors, radius, spacing, moderateScale } from '../../theme';
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
            <Icon name="help-circle-outline" size={moderateScale(20)} color={colors.primary} />
            <Text style={styles.rowText}>Help & Support</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.row}>
            <Icon name="document-text-outline" size={moderateScale(20)} color={colors.primary} />
            <Text style={styles.rowText}>Terms & Privacy</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Icon name="log-out-outline" size={moderateScale(20)} color={colors.surface} />
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
      padding: moderateScale(spacing.lg),
      gap: moderateScale(spacing.lg),
    },
    section: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: moderateScale(spacing.lg),
      gap: moderateScale(spacing.md),
      shadowColor: 'rgba(16, 36, 84, 0.06)',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
      elevation: 6,
    },
    sectionTitle: {
      fontSize: moderateScale(18),
      color: colors.textPrimary,
      fontFamily: 'Poppins-SemiBold',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: moderateScale(spacing.md),
    },
    rowText: {
      fontSize: moderateScale(15),
      color: colors.textPrimary,
      fontFamily: 'Poppins-Regular',
    },
    signOutButton: {
      height: moderateScale(52),
      borderRadius: radius.md,
      backgroundColor: colors.accent,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: moderateScale(spacing.sm),
      shadowColor: 'rgba(230, 57, 70, 0.3)',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 18,
      elevation: 8,
    },
    signOutText: {
      fontSize: moderateScale(16),
      color: colors.surface,
      fontFamily: 'Poppins-SemiBold',
    },
  });

export default SettingsScreen;

