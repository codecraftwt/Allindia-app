import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../../context/ThemeContext';
import { spacing } from '../../../../theme/spacing';

const { width } = Dimensions.get('window');
const ORANGE_COLOR = '#FF9800';

export const CommingSoonAi: React.FC = () => {
    const { colors } = useTheme();
    const [notified, setNotified] = useState(false);

    const handleNotifyPress = () => {
        setNotified(true);
        Alert.alert(
            '🎙️ Waitlist Joined!',
            'You will get early access to the AI Mock Interview feature as soon as it goes live.',
            [{ text: 'Awesome' }]
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.badge}>
                    <Icon name="sparkles" size={10} color={ORANGE_COLOR} style={{ marginRight: 4 }} />
                    <Text style={styles.badgeText}>AI Lab preview</Text>
                </View>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                    Upcoming AI Tools
                </Text>
                <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                    Practice your speaking and confidence with our upcoming conversational AI tools.
                </Text>
            </View>

            <View style={[styles.demoCard, { backgroundColor: '#0f172a' }]}>
                {/* Mock App Header */}
                <View style={styles.mockHeader}>
                    <View style={styles.avatarContainer}>
                        <View style={[styles.avatarGlow, { backgroundColor: ORANGE_COLOR }]} />
                        <View style={styles.avatar}>
                            <Icon name="hardware-chip" size={18} color="#fff" />
                        </View>
                        <View style={styles.onlineDot} />
                    </View>
                    <View style={styles.mockHeaderInfo}>
                        <Text style={styles.botName}>AI Voice Interviewer</Text>
                        <Text style={styles.botStatus}>Ready to ask questions...</Text>
                    </View>
                    <View style={styles.featureLabel}>
                        <Text style={styles.featureLabelText}>VOICE BETA</Text>
                    </View>
                </View>

                {/* Mock Question Dialog */}
                <View style={styles.chatArea}>
                    <View style={styles.speechBubble}>
                        <View style={styles.speechTail} />
                        <Text style={styles.speechText}>
                            "Can you describe a challenging bug you solved recently in React Native, and how you diagnosed it?"
                        </Text>
                    </View>
                </View>

                {/* Mock Voice UI */}
                <View style={styles.voiceUiArea}>
                    <View style={styles.waveformContainer}>
                        <View style={[styles.waveBar, { height: 12, backgroundColor: ORANGE_COLOR }]} />
                        <View style={[styles.waveBar, { height: 28, backgroundColor: ORANGE_COLOR }]} />
                        <View style={[styles.waveBar, { height: 42, backgroundColor: ORANGE_COLOR }]} />
                        <View style={[styles.waveBar, { height: 18, backgroundColor: ORANGE_COLOR }]} />
                        <View style={[styles.waveBar, { height: 35, backgroundColor: ORANGE_COLOR }]} />
                        <View style={[styles.waveBar, { height: 14, backgroundColor: ORANGE_COLOR }]} />
                        <View style={[styles.waveBar, { height: 8, backgroundColor: ORANGE_COLOR }]} />
                    </View>

                    <View style={styles.micOuterCircle}>
                        <View style={[styles.micPulse, { backgroundColor: ORANGE_COLOR + '30' }]} />
                        <View style={[styles.micButton, { backgroundColor: ORANGE_COLOR }]}>
                            <Icon name="mic" size={24} color="#fff" />
                        </View>
                    </View>
                    <Text style={styles.tapToTalkText}>Hold to answer question (Coming Soon)</Text>
                </View>

                {/* Corner Ribbon */}
                <View style={styles.comingSoonRibbon}>
                    <Text style={styles.ribbonText}>LAUNCHING SOON</Text>
                </View>
            </View>

            {/* Action / Waitlist Button */}
            <TouchableOpacity
                style={[
                    styles.notifyBtn,
                    {
                        backgroundColor: notified ? '#10b981' : ORANGE_COLOR,
                        shadowColor: notified ? '#10b981' : ORANGE_COLOR,
                    },
                ]}
                onPress={handleNotifyPress}
                disabled={notified}
                activeOpacity={0.8}
            >
                <Icon
                    name={notified ? 'checkmark-circle' : 'notifications'}
                    size={16}
                    color="#fff"
                    style={{ marginRight: 6 }}
                />
                <Text style={styles.notifyBtnText}>
                    {notified ? "You're on the Waitlist!" : 'Notify Me When Available'}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: spacing.md,
        width: '100%',
        paddingHorizontal: spacing.md,
    },
    header: {
        marginBottom: spacing.md,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: ORANGE_COLOR + '18',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        alignSelf: 'flex-start',
        marginBottom: 6,
    },
    badgeText: {
        fontSize: 9,
        fontWeight: '900',
        color: ORANGE_COLOR,
        textTransform: 'uppercase',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: -0.4,
    },
    sectionSubtitle: {
        fontSize: 12,
        lineHeight: 16,
        marginTop: 2,
    },
    demoCard: {
        width: '100%',
        borderRadius: 24,
        padding: 16,
        overflow: 'hidden',
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 15,
        elevation: 8,
        borderWidth: 1,
        borderColor: '#334155',
    },
    mockHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#1e293b',
        paddingBottom: 12,
    },
    avatarContainer: {
        position: 'relative',
        width: 38,
        height: 38,
        marginRight: 10,
    },
    avatarGlow: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 19,
        opacity: 0.35,
    },
    avatar: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: '#1e293b',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#475569',
    },
    onlineDot: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#10b981',
        borderWidth: 1.5,
        borderColor: '#0f172a',
    },
    mockHeaderInfo: {
        flex: 1,
    },
    botName: {
        color: '#f8fafc',
        fontSize: 13,
        fontWeight: '800',
    },
    botStatus: {
        color: '#94a3b8',
        fontSize: 10,
    },
    featureLabel: {
        backgroundColor: '#1e293b',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#334155',
    },
    featureLabelText: {
        color: '#cbd5e1',
        fontSize: 8,
        fontWeight: '900',
    },
    chatArea: {
        marginBottom: 22,
        alignItems: 'flex-start',
    },
    speechBubble: {
        backgroundColor: '#1e293b',
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 12,
        maxWidth: '90%',
        position: 'relative',
        borderWidth: 1,
        borderColor: '#334155',
    },
    speechTail: {
        position: 'absolute',
        left: -6,
        top: 14,
        width: 12,
        height: 12,
        backgroundColor: '#1e293b',
        transform: [{ rotate: '45deg' }],
        borderBottomWidth: 1,
        borderBottomColor: '#334155',
        borderLeftWidth: 1,
        borderLeftColor: '#334155',
    },
    speechText: {
        color: '#e2e8f8',
        fontSize: 12,
        lineHeight: 16,
        fontStyle: 'italic',
    },
    voiceUiArea: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
    },
    waveformContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
        marginBottom: 16,
    },
    waveBar: {
        width: 4,
        borderRadius: 2,
        marginHorizontal: 3.5,
    },
    micOuterCircle: {
        width: 64,
        height: 64,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        marginBottom: 10,
    },
    micPulse: {
        position: 'absolute',
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    micButton: {
        width: 54,
        height: 54,
        borderRadius: 27,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: ORANGE_COLOR,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 5,
    },
    tapToTalkText: {
        color: '#64748b',
        fontSize: 10,
        fontWeight: '600',
    },
    comingSoonRibbon: {
        position: 'absolute',
        top: 14,
        right: -32,
        backgroundColor: ORANGE_COLOR,
        paddingHorizontal: 30,
        paddingVertical: 4,
        transform: [{ rotate: '45deg' }],
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 4,
    },
    ribbonText: {
        color: '#fff',
        fontSize: 8,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    notifyBtn: {
        width: '100%',
        height: 48,
        borderRadius: 14,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 3,
    },
    notifyBtnText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '800',
    },
});
