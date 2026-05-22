import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { spacing } from '../../../../theme/spacing';
import { radius } from '../../../../theme/radius';
import { typography } from '../../../../theme/typography';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../../redux/store';
import { HomeStackParamList } from '../../../../navigation/types';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface QuickFilterCardProps {
    title: string;
    icon: string;
    color: string;
    onPress: () => void;
    colors: any;
}

const QuickFilterCard = ({ title, icon, color, onPress, colors }: QuickFilterCardProps) => {
    const shineX = useSharedValue(-150);

    React.useEffect(() => {
        shineX.value = withRepeat(
            withTiming(250, {
                duration: 2200,
                easing: Easing.bezier(0.4, 0, 0.2, 1),
            }),
            -1,
            false
        );
    }, []);

    const animatedShineStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: shineX.value },
            { rotate: '35deg' }
        ],
    }));

    return (
        <Pressable
            onPress={onPress}
            style={[
                styles.card,
                {
                    backgroundColor: color + '15',
                    borderColor: colors.border,
                    shadowColor: color,
                }
            ]}
        >
            {/* Animated Glass Shine Reflection - No more internal squares */}
            <Animated.View style={[styles.glassShine, animatedShineStyle]} />

            {/* Decorative Dots Pattern in Top Right */}
            <View style={styles.dotPattern}>
                {[...Array(12)].map((_, i) => (
                    <View key={i} style={[styles.dot, { backgroundColor: color, opacity: 0.2 }]} />
                ))}
            </View>

            <View style={[styles.iconCircle, { backgroundColor: color, shadowColor: color }]}>
                <Icon name={icon} size={18} color="#fff" />
            </View>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]} numberOfLines={2}>
                {title}
            </Text>
        </Pressable>
    );
};

export const QuickFilterCards = React.memo(({ colors }: { colors: any }) => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const dispatch = useDispatch<AppDispatch>();

    const quickFilters = [
        {
            id: 'high_paying',
            title: 'High Paying Jobs',
            icon: 'money',
            color: '#10b981', // Emerald
            filters: { salary_min: 600000 }
        },
        {
            id: 'nearby',
            title: 'Nearby Jobs',
            icon: 'map-marker',
            color: '#3b82f6', // Blue
            filters: { section: 'nearby' }
        },
        {
            id: 'all_jobs',
            title: 'All Jobs',
            icon: 'briefcase',
            color: '#f59e0b', // Amber
            filters: {}
        }
    ];

    const handlePress = (filter: any) => {
        // Navigate to AllJobs tab, then to AllJobsList screen with filters
        navigation.navigate('AllJobs', {
            screen: 'AllJobsList',
            params: { 
                filters: filter.filters,
                quickFilterId: filter.id 
            }
        } as any);
    };

    return (
        <View style={styles.container}>
            <Text style={[typography.sectionTitle, { color: colors.textPrimary, marginBottom: spacing.sm, marginLeft: spacing.xs }]}>
                Quick Filters
            </Text>
            <View style={styles.row}>
                {quickFilters.map((item) => (
                    <QuickFilterCard
                        key={item.id}
                        title={item.title}
                        icon={item.icon}
                        color={item.color}
                        colors={colors}
                        onPress={() => handlePress(item)}
                    />
                ))}
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        marginTop: spacing.md,
        marginBottom: spacing.xs,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: spacing.sm,
    },
    card: {
        flex: 1,
        padding: spacing.xs,
        paddingVertical: spacing.sm,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.8)',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 100,
        overflow: 'hidden',
    },
    glassShine: {
        position: 'absolute',
        width: 45,
        height: '300%',
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        top: -100,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.xs,
        elevation: 4,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    cardTitle: {
        fontSize: 12,
        fontWeight: '800',
        textAlign: 'center',
        lineHeight: 15,
    },
    dotPattern: {
        position: 'absolute',
        top: 10,
        right: 10,
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: 24,
        gap: 3,
        justifyContent: 'flex-end',
        opacity: 0.8,
    },
    dot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
    },
});
