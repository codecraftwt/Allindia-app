import React from 'react';
import { ScrollView, Pressable, View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { typography } from '../../../../theme/typography';
import { spacing } from '../../../../theme/spacing';
import type { ThemeColors } from '../../../../theme/colors';
import { useTranslation } from 'react-i18next';

interface HomeCategoriesSectionProps {
  categories: any[];
  colors: ThemeColors;
  navigation: any;
  homeCategoriesMock: any[];
  isDark?: boolean;
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
        <Icon name={icon} size={18} color={iconColor ?? colors.primary} style={styles.sectionIcon} />
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
}) => {
  const { t } = useTranslation();
  const displayData = (categories && categories.length > 0) ? categories : (homeCategoriesMock || []);

  return (
    <View style={[styles.container, { minHeight: 100 }]}>
      <SectionHeader
        title={t('home.categories', 'Categories')}
        colors={colors}
        onPress={() => navigation.navigate('JobCategories')}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesScroll}
        style={{ minHeight: 60 }}
        decelerationRate="fast">
        {displayData.map((cat, idx) => {
          const catName = cat.name || cat.label || 'Category';
          const catIcon = cat.icon || getCategoryIcon(catName);

          return (
            <Pressable
              key={cat.id || `cat-${idx}`}
              onPress={() => {
                if (cat.id) {
                  navigation.navigate('IndustryCategory', { categoryId: cat.id, categoryName: catName });
                } else {
                  navigation.navigate('JobListing', { filters: { category_id: undefined }, categoryName: catName });
                }
              }}
              style={[
                styles.categoryCard,
                {
                  backgroundColor: getCategoryColor(catName, isDark),
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                  shadowColor: colors.shadow,
                },
              ]}>
              <View style={[styles.categoryIconBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.6)' }]}>
                <Icon name={catIcon} size={22} color="#000000" />
              </View>
              <Text style={[styles.categoryLabel, { color: "#000000" }]} numberOfLines={3}>
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
    paddingTop: 10,
    paddingBottom: 12,
    marginTop: 0,
    paddingHorizontal: spacing.xs,
  },
  sectionIcon: {
    marginRight: spacing.sm,
  },
  categoriesScroll: {
    paddingRight: spacing.md,
    gap: 10,
    paddingVertical: 4,
  },
  categoryCard: {
    width: 105,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    borderWidth: 1,
    padding: 10,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryIconBox: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryLabel: {
    ...typography.tiny,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 2,
    lineHeight: 14,
  },
});

export default React.memo(HomeCategoriesSection);
