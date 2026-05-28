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

const getCategoryColor = (name: string, isDark: boolean) => {
  const n = name.toLowerCase();
  let color = '#5C9CE6'; // A solid, attractive blue default (not too bright)

  if (n.includes('beauty')) color = '#FFAEBC';
  else if (n.includes('banking')) color = '#b2ed7bff'; // Gold/Yellow for Banking (Card 2)
  else if (n.includes('automobile')) color = '#ffd256ff'; // Steel Blue for Automobile (Card 1)
  else if (n.includes('bpm') || n.includes('bpo')) color = '#FBC4AB'; // Coral/Peach for BPM/BPO
  else if (n.includes('engineering') && !n.includes('hardware') && !n.includes('network')) color = '#B8C0FF'; // Soft purple-blue for General Engineering
  else if (n.includes('internet')) color = '#8EECF5'; // Tech Cyan/Teal for Internet
  else if (n.includes('textile')) color = '#F3C4FB'; // Orchid Pink for Textile
  else if (n.includes('construction')) color = '#C2C5BB';
  else if (n.includes('content') || n.includes('journalism')) color = '#FFD0A3';
  else if (n.includes('data science') || n.includes('analytics')) color = '#9CF6F6';
  else if (n.includes('delivery') || n.includes('driver')) color = '#FFC4B4';
  else if (n.includes('design') || n.includes('architecture')) color = '#BCEAE3';
  else if (n.includes('hardware') || n.includes('network')) color = '#C5D3C2';
  else if (n.includes('fashion') || n.includes('tailoring')) color = '#FFC6FF';
  else if (n.includes('healthcare') || n.includes('doctor') || n.includes('hospital')) color = '#FFADAD';
  else if (n.includes('hospitality') || n.includes('restaurant') || n.includes('tourism')) color = '#FDE293';
  else if (n.includes('house help') || n.includes('worker')) color = '#DFD3C3';
  else if (n.includes('human resources') || n.includes('hr')) color = '#B9FBC0';
  else if (n.includes('it services') || n === 'it') color = '#A0C4FF';
  else if (n.includes('development')) color = '#BDB2FF';
  else if (n.includes('finance')) color = '#FDFFB6';
  else if (n.includes('education') || n.includes('teacher') || n === 'edu') color = '#CAFFBF';
  else if (n.includes('labour') || n.includes('factory')) color = '#D7E3FC';
  else if (n.includes('legal')) color = '#E2ECE9';
  else if (n.includes('marketing')) color = '#FFF59D';
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
  if (n.includes('automobile')) return 'car';
  if (n.includes('banking')) return 'university';
  if (n.includes('bpm') || n.includes('bpo')) return 'headphones';
  if (n.includes('engineering')) return 'gears';
  if (n.includes('internet')) return 'globe';
  if (n.includes('textile')) return 'scissors';
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
