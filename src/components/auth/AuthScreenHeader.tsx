import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import type { ThemeColors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography, moderateScale } from '../../theme/typography';
import { radius } from '../../theme/radius';

type Props = {
  title?: string;
  onBack: () => void;
  colors: ThemeColors;
};

export const AuthScreenHeader: React.FC<Props> = ({ title, onBack, colors }) => (
  <View style={styles.bar}>
    <Pressable
      onPress={onBack}
      hitSlop={14}
      style={({ pressed }) => [
        styles.sideSlot,
        styles.leftBtn,
        { backgroundColor: pressed ? colors.surfaceMuted : 'transparent' },
      ]}>
      <Icon name="chevron-left" size={moderateScale(20)} color={colors.textPrimary} />
    </Pressable>

    {title ? (
      <Text
        style={[typography.sectionTitle, styles.title, { color: colors.textPrimary }]}
        numberOfLines={1}>
        {title}
      </Text>
    ) : (
      <View style={styles.titlePlaceholder} />
    )}

    <View style={styles.sideSlot} />
  </View>
);

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    minHeight: moderateScale(48),
  },
  sideSlot: {
    width: moderateScale(44),
    height: moderateScale(44),
  },
  leftBtn: {
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: moderateScale(17),
    textAlign: 'center',
  },
  titlePlaceholder: {
    flex: 1,
  },
});
