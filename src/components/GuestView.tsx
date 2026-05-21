import React from 'react';
import { View, Text, StyleSheet, Pressable, Image, ImageSourcePropType } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
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
    navigation.navigate('SignIn' as never);
  };

  const goToLogin = () => {
    navigation.navigate('EmailLogin' as never);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.iconCircle, { backgroundColor: colors.primary + '15', overflow: 'hidden' }]}>
          {image ? (
            <Image source={image} style={styles.imageIcon} />
          ) : (
            <Icon name={icon || 'user'} size={32} color={colors.primary} />
          )}
        </View>
        <Text style={[typography.h4, { color: colors.textPrimary, marginTop: 20, textAlign: 'center' }]}>
          {title}
        </Text>
        <Text style={[typography.body, { color: colors.textSecondary, marginTop: 12, textAlign: 'center', lineHeight: 22 }]}>
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
    padding: 24,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBox: {
    width: '100%',
    marginTop: 32,
    gap: 16,
  },
  loginBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  imageIcon: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});

export default GuestView;
