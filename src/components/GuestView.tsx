import React from 'react';
import { View, Text, StyleSheet, Pressable, Image, ImageSourcePropType } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { spacing } from '../theme/spacing';
import { typography, moderateScale } from '../theme/typography';
import { radius } from '../theme/radius';
import { PrimaryButton } from './auth';

interface GuestViewProps {
  title: string;
  subtitle: string;
  icon?: string;
  image?: ImageSourcePropType;
}

const GuestView: React.FC<GuestViewProps> = ({ title, subtitle, icon, image }) => {
  const { colors } = useTheme();
  const navigation = useNavigation();

  const goToRegister = () => {
    navigation.navigate('Login' as never);
  };

  const goToLogin = () => {
    navigation.navigate('Login' as never);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.iconCircle, { backgroundColor: colors.primary + '15', overflow: 'hidden' }]}>
          {image ? (
            <Image source={image} style={styles.imageIcon} />
          ) : (
            <Icon name={icon || 'user'} size={moderateScale(32)} color={colors.primary} />
          )}
        </View>
        <Text style={[typography.h4, { color: colors.textPrimary, marginTop: moderateScale(18), textAlign: 'center' }]}>
          {title}
        </Text>
        <Text style={[typography.body, { color: colors.textSecondary, marginTop: moderateScale(10), textAlign: 'center', lineHeight: moderateScale(22) }]}>
          {subtitle}
        </Text>
        
        <View style={styles.actionBox}>
          <PrimaryButton 
            title="Register Now" 
            onPress={goToRegister} 
            colors={colors} 
          />
          <Pressable 
            onPress={goToLogin}
            style={styles.loginBtn}
          >
            <Text style={[typography.labelMedium, { color: colors.primary }]}>Already have an account? Log In</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    padding: moderateScale(24),
    borderRadius: radius.xl,
    borderWidth: 1,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  iconCircle: {
    width: moderateScale(76),
    height: moderateScale(76),
    borderRadius: moderateScale(38),
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBox: {
    width: '100%',
    marginTop: moderateScale(28),
    gap: moderateScale(14),
  },
  loginBtn: {
    alignItems: 'center',
    paddingVertical: moderateScale(8),
  },
  imageIcon: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});

export default GuestView;
