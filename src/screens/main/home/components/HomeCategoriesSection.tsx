import React from 'react';
import { ScrollView, Pressable, View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { typography } from '../../../../theme/typography';
import { spacing } from '../../../../theme/spacing';
import type { ThemeColors } from '../../../../theme/colors';

interface HomeCategoriesSectionProps {
  categories: any[];
  colors: ThemeColors;
  navigation: any;
  homeCategoriesMock: any[];
  isDark?: boolean;
}

const getCategoryColor = (name: string, isDark: boolean) => {
  const n = name.toLowerCase();
  let color = '#F1F5F9';
  if (n.includes('beauty')) color = '#FDE2E4';
  else if (n.includes('construction')) color = '#E2E2E2';
  else if (n.includes('content') || n.includes('journalism')) color = '#FFF1E6';
  else if (n.includes('data science') || n.includes('analytics')) color = '#E0FBFC';
  else if (n.includes('delivery') || n.includes('driver')) color = '#FFDDD2';
  else if (n.includes('design') || n.includes('architecture')) color = '#EAF4F4';
  else if (n.includes('hardware') || n.includes('network')) color = '#D8E2DC';
  else if (n.includes('fashion') || n.includes('tailoring')) color = '#FAD2E1';
  else if (n.includes('healthcare') || n.includes('doctor') || n.includes('hospital')) color = '#FFADAD';
  else if (n.includes('hospitality') || n.includes('restaurant') || n.includes('tourism')) color = '#FFE5B4';
  else if (n.includes('house help') || n.includes('worker')) color = '#ECE4DB';
  else if (n.includes('human resources') || n.includes('hr')) color = '#B9FBC0';
  else if (n.includes('it services') || n.includes('development')) color = '#A0C4FF';
  else if (n.includes('labour') || n.includes('factory')) color = '#D7E3FC';
  else if (n.includes('legal')) color = '#E2ECE9';
  else if (n.includes('marketing')) color = '#FDFFB6';
  else if (n.includes('media') || n.includes('entertainment')) color = '#BDB2FF';
  else if (n.includes('operations')) color = '#D0F4DE';
  else if (n.includes('purchase') || n.includes('supply chain')) color = '#FFC6FF';
  else if (n.includes('sales')) color = '#CAFFBF';
  else if (n.includes('security')) color = '#E5E5E5';
  else if (n.includes('sport') || n.includes('fitness')) color = '#FFD6A5';
  else if (n.includes('technician') || n.includes('vehicle')) color = '#CFBCFF';

  return isDark ? color + 'CC' : color; // CC is 80% opacity, bright enough for black text
};

const getCategoryIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('beauty')) return 'magic';
  if (n.includes('construction')) return 'building';
  if (n.includes('content') || n.includes('journalism')) return 'pencil';
  if (n.includes('data science') || n.includes('analytics')) return 'database';
  if (n.includes('delivery') || n.includes('driver')) return 'truck';
  if (n.includes('design') || n.includes('architecture')) return 'paint-brush';
  if (n.includes('hardware') || n.includes('network')) return 'server';
  if (n.includes('fashion') || n.includes('tailoring')) return 'scissors';
  if (n.includes('healthcare') || n.includes('doctor') || n.includes('hospital')) return 'user-md';
  if (n.includes('hospitality') || n.includes('restaurant') || n.includes('tourism')) return 'coffee';
  if (n.includes('house help') || n.includes('worker')) return 'home';
  if (n.includes('human resources') || n.includes('hr')) return 'users';
  if (n.includes('it services') || n.includes('development')) return 'code';
  if (n.includes('labour') || n.includes('factory')) return 'industry';
  if (n.includes('legal')) return 'balance-scale';
  if (n.includes('marketing')) return 'bullhorn';
  if (n.includes('media') || n.includes('entertainment')) return 'film';
  if (n.includes('operations')) return 'cogs';
  if (n.includes('purchase') || n.includes('supply chain')) return 'shopping-cart';
  if (n.includes('sales')) return 'line-chart';
  if (n.includes('security')) return 'shield';
  if (n.includes('sport') || n.includes('fitness')) return 'heartbeat';
  if (n.includes('technician') || n.includes('vehicle')) return 'wrench';
  return 'briefcase';
};

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
  return (
    <View style={styles.sectionHeader}>
      {icon ? (
        <Icon name={icon} size={18} color={iconColor ?? colors.primary} style={styles.sectionIcon} />
      ) : null}
      <Text style={[typography.sectionTitle, { color: colors.textPrimary, flex: 1 }]}>{title}</Text>
      <Pressable hitSlop={8} onPress={onPress}>
        <Text style={[typography.labelMedium, { color: colors.primary }]}>See all</Text>
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
  const displayData = (categories && categories.length > 0) ? categories : (homeCategoriesMock || []);

  return (
    <View style={[styles.container, { minHeight: 100 }]}>
      <SectionHeader
        title="Categories"
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

export default HomeCategoriesSection;
