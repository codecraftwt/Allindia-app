import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context/ThemeContext';
import { spacing } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import { radius } from '../../../theme/radius';
import { RootState, AppDispatch } from '../../../redux/store';
import { setSelectedLocation } from '../../../redux/slice/addressSlice';

const { width } = Dimensions.get('window');

const POPULAR_CITIES = [
  { id: '1', name: 'Mumbai', sub: 'Maharashtra' },
  { id: '2', name: 'Delhi', sub: 'NCR' },
  { id: '3', name: 'Bangalore', sub: 'Karnataka' },
  { id: '4', name: 'Hyderabad', sub: 'Telangana' },
  { id: '5', name: 'Pune', sub: 'Maharashtra' },
  { id: '6', name: 'Chennai', sub: 'Tamil Nadu' },
  { id: '7', name: 'Kolkata', sub: 'West Bengal' },
  { id: '8', name: 'Ahmedabad', sub: 'Gujarat' },
];

const AREAS_MOCK: Record<string, string[]> = {
  'Mumbai': ['Andheri East', 'Andheri West', 'Bandra', 'Borivali', 'Dadar', 'Goregaon', 'Malad', 'Powai', 'Thane', 'Vashi', 'Worli'],
  'Delhi': ['Connaught Place', 'Dwarka', 'Karol Bagh', 'Lajpat Nagar', 'Rohini', 'Saket', 'Vasant Kunj'],
  'Bangalore': ['Indiranagar', 'Koramangala', 'Whitefield', 'HSR Layout', 'Electronic City', 'Jayanagar'],
  'Pune': ['Baner', 'Hinjewadi', 'Kothrud', 'Viman Nagar', 'Wakad'],
};

const LocationScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { selectedCity, selectedArea } = useSelector((state: RootState) => state.address || {});

  const [search, setSearch] = useState('');
  const [activeStep, setActiveStep] = useState<'city' | 'area'>(selectedCity ? 'area' : 'city');
  const [tempCity, setTempCity] = useState(selectedCity || 'Mumbai');

  const handleCitySelect = (city: string) => {
    setTempCity(city);
    setActiveStep('area');
  };

  const handleAreaSelect = (area: string) => {
    dispatch(setSelectedLocation({ city: tempCity, area: area }));
    navigation.goBack();
  };

  const currentAreas = AREAS_MOCK[tempCity] || AREAS_MOCK['Mumbai'];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={[typography.h3, { color: colors.textPrimary }]}>Choose Location</Text>
      </View>

      <View style={styles.content}>
        <View style={[styles.searchContainer, { backgroundColor: colors.surfaceHighlight }]}>
          <Icon name="search" size={20} color={colors.textPlaceholder} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder={activeStep === 'city' ? "Search your city" : "Search your area"}
            placeholderTextColor={colors.textPlaceholder}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* Use Current Location Button */}
          <Pressable style={[styles.currentLocation, { backgroundColor: colors.primary + '10' }]}>
            <View style={[styles.gpsCircle, { backgroundColor: colors.primary }]}>
              <Icon name="navigation" size={16} color="#FFF" />
            </View>
            <View style={styles.gpsText}>
              <Text style={[typography.labelMedium, { color: colors.primary, fontWeight: 'bold' }]}>
                Use Current Location
              </Text>
              <Text style={[typography.tiny, { color: colors.textSecondary }]}>
                Using GPS to find your location
              </Text>
            </View>
          </Pressable>

          {/* New Selection Bar below Current Location */}
          <View style={[styles.selectionBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Pressable
              onPress={() => setActiveStep('city')}
              style={[
                styles.selectionItem,
                activeStep === 'city' && { backgroundColor: colors.primary + '15', borderRadius: radius.md }
              ]}
            >
              <Text style={[styles.selectionLabel, { color: activeStep === 'city' ? colors.primary : colors.textSecondary }]}>
                CITY
              </Text>
              <Text style={[styles.selectionValue, { color: colors.textPrimary }]} numberOfLines={1}>
                {tempCity}
              </Text>
            </Pressable>

            <View style={[styles.separator, { backgroundColor: colors.border }]} />

            <Pressable
              onPress={() => setActiveStep('area')}
              style={[
                styles.selectionItem,
                activeStep === 'area' && { backgroundColor: colors.primary + '15', borderRadius: radius.md }
              ]}
            >
              <Text style={[styles.selectionLabel, { color: activeStep === 'area' ? colors.primary : colors.textSecondary }]}>
                AREA
              </Text>
              <Text style={[styles.selectionValue, { color: colors.textPrimary }]} numberOfLines={1}>
                {activeStep === 'city' ? 'Select Area' : (selectedArea || 'Select Area')}
              </Text>
            </Pressable>
          </View>

          {activeStep === 'city' ? (
            <View style={styles.section}>
              <Text style={[typography.labelMedium, { color: colors.textSecondary, marginBottom: 16 }]}>
                POPULAR CITIES
              </Text>
              <View style={styles.citiesGrid}>
                {POPULAR_CITIES.map((city) => (
                  <Pressable
                    key={city.id}
                    onPress={() => handleCitySelect(city.name)}
                    style={[
                      styles.cityChip,
                      { backgroundColor: colors.surface, borderColor: tempCity === city.name ? colors.primary : colors.border }
                    ]}
                  >
                    <Text style={[typography.labelMedium, { color: tempCity === city.name ? colors.primary : colors.textPrimary }]}>
                      {city.name}
                    </Text>
                    <Text style={[typography.tiny, { color: colors.textSecondary }]}>{city.sub}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.section}>
              <Text style={[typography.labelMedium, { color: colors.textSecondary, marginBottom: 16 }]}>
                AREAS IN {tempCity.toUpperCase()}
              </Text>
              <View style={styles.areasList}>
                {currentAreas.map((area, index) => (
                  <Pressable
                    key={index}
                    onPress={() => handleAreaSelect(area)}
                    style={[styles.areaItem, { borderBottomColor: colors.border }]}
                  >
                    <Icon name="map-pin" size={16} color={colors.textPlaceholder} />
                    <Text style={[typography.body, { color: colors.textPrimary, marginLeft: 12 }]}>{area}</Text>
                    <Icon name="chevron-right" size={16} color={colors.textPlaceholder} style={{ marginLeft: 'auto' }} />
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: 16,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  content: { flex: 1 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: spacing.md,
    paddingHorizontal: spacing.md,
    height: 50,
    borderRadius: radius.lg,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  scroll: { paddingBottom: 40 },
  currentLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    padding: 16,
    borderRadius: radius.xl,
    marginBottom: 16,
  },
  gpsCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gpsText: { flex: 1, marginLeft: 16 },

  selectionBar: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    padding: 8,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: 24,
    alignItems: 'center',
  },
  selectionItem: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  selectionLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  selectionValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  separator: {
    width: 1,
    height: '60%',
    marginHorizontal: 8,
  },

  section: { paddingHorizontal: spacing.md, marginBottom: 24 },
  citiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  cityChip: {
    width: (width - spacing.md * 2 - 20) / 3,
    padding: 12,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  areasList: {
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  areaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});

export default LocationScreen;
