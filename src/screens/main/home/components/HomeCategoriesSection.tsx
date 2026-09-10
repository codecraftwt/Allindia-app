import React from 'react';
import { ScrollView, Pressable, View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { typography, moderateScale } from '../../../../theme/typography';
import { spacing } from '../../../../theme/spacing';
import { radius } from '../../../../theme/radius';
import type { ThemeColors } from '../../../../theme/colors';
import { useTranslation } from 'react-i18next';
import SkeletonPulse from '../../../../components/SkeletonPulse';

interface HomeCategoriesSectionProps {
  categories: any[];
  colors: ThemeColors;
  navigation: any;
  homeCategoriesMock: any[];
  isDark?: boolean;
  loading?: boolean;
}

import { getCategoryColor, getCategoryIcon } from '../../../../utils/categoryUtils';

function SectionHeader({
  title,
  icon,
  iconColor,
  colors,
  onPress,
}: {
  title: string;
  icon?: string;
  iconColor?: string;
  colors: ThemeColors;
  onPress?: () => void;
}) {
  const { t } = useTranslation();
  return (
    <View style={styles.sectionHeader}>
      {icon ? (
        <Icon name={icon} size={moderateScale(16)} color={iconColor ?? colors.primary} style={styles.sectionIcon} />
      ) : null}
      <Text style={[typography.sectionTitle, { color: colors.textPrimary, flex: 1 }]}>{title}</Text>
      <Pressable hitSlop={8} onPress={onPress}>
        <Text style={[typography.labelMedium, { color: colors.primary }]}>{t('home.seeAll', 'See all')}</Text>
      </Pressable>
    </View>
  );
}

const HomeCategoriesSection: React.FC<HomeCategoriesSectionProps> = ({
  categories,
  colors,
  navigation,
  homeCategoriesMock,
  isDark = false,
  loading = false,
}) => {
  const { t } = useTranslation();
  const displayData = (categories && categories.length > 0) ? categories : (homeCategoriesMock || []);

  if (loading) {
    return (
      <View style={[styles.container, { minHeight: moderateScale(95) }]}>
        <SectionHeader
          title={t('home.categories', 'Categories')}
          colors={colors}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
          style={{ minHeight: moderateScale(60) }}
          decelerationRate="fast">
          {[1, 2, 3, 4, 5].map(i => (
            <View
              key={i}
              style={[
                styles.categoryCard,
                {
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                },
              ]}>
              <SkeletonPulse style={styles.categoryIconBox} />
              <SkeletonPulse style={{ width: moderateScale(55), height: 10, borderRadius: 5, marginBottom: 6 }} />
              <SkeletonPulse style={{ width: moderateScale(35), height: 10, borderRadius: 5 }} />
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { minHeight: moderateScale(95) }]}>
      <SectionHeader
        title={t('home.categories', 'Categories')}
        colors={colors}
        onPress={() => {
          if (navigation.getState()?.routeNames?.includes('JobCategories')) {
            navigation.navigate('JobCategories');
          } else {
            navigation.navigate('Home', { screen: 'JobCategories', params: { from: 'AllJobs' } });
          }
        }}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesScroll}
        style={{ minHeight: moderateScale(60) }}
        decelerationRate="fast">
        {displayData.map((cat, idx) => {
          const catName = cat.name || cat.label || 'Category';
          const catIcon = cat.icon || getCategoryIcon(catName);

          return (
            <Pressable
              key={cat.id || `cat-${idx}`}
              onPress={() => {
                const hasRoute = (name: string) => navigation.getState()?.routeNames?.includes(name);
                
                if (cat.id) {
                  if (hasRoute('IndustryCategory')) {
                    navigation.navigate('IndustryCategory', { categoryId: cat.id, categoryName: catName });
                  } else {
                    navigation.navigate('Home', { screen: 'IndustryCategory', params: { categoryId: cat.id, categoryName: catName } });
                  }
                } else {
                  if (hasRoute('JobListing')) {
                    navigation.navigate('JobListing', { filters: { category_id: undefined }, categoryName: catName });
                  } else {
                    navigation.navigate('Home', { screen: 'JobListing', params: { filters: { category_id: undefined }, categoryName: catName } });
                  }
                }
              }}
              style={[
                styles.categoryCard,
                {
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                  shadowColor: colors.shadow,
                },
              ]}>
              <View style={[styles.categoryIconBox, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Icon name={catIcon} size={moderateScale(14)} color="#FFFFFF" />
              </View>
              <Text style={[styles.categoryLabel, { color: "#FFFFFF" }]} numberOfLines={1}>
                {catName}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: moderateScale(10),
    paddingBottom: moderateScale(10),
    marginTop: 0,
    paddingHorizontal: spacing.xs,
  },
  sectionIcon: {
    marginRight: spacing.sm,
  },
  categoriesScroll: {
    paddingRight: spacing.md,
    gap: moderateScale(10),
    paddingVertical: 4,
  },
  categoryCard: {
    width: moderateScale(100),
    height: moderateScale(76),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    padding: moderateScale(8),
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryIconBox: {
    width: moderateScale(28),
    height: moderateScale(28),
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: moderateScale(6),
  },
  categoryLabel: {
    ...typography.tiny,
    fontSize: moderateScale(11),
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 2,
    lineHeight: moderateScale(14),
  },
});

export default React.memo(HomeCategoriesSection);
