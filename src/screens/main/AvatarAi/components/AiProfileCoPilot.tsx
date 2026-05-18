import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Animated,
  ActivityIndicator,
  Easing,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { typography } from '../../../../theme/typography';
import { spacing } from '../../../../theme/spacing';

interface AiProfileCoPilotProps {
  currentQuestionKey: 'email' | 'phone' | 'linkedin' | 'github' | 'education' | 'experience' | 'objective' | 'certifications' | 'languages' | 'achievements' | 'hobbies' | 'projects' | 'complete' | null;
  chatMessages: any[];
  inputText: string;
  setInputText: (text: string) => void;
  isKeyboardVisible: boolean;
  colors: any;
  isDark: boolean;
  getSuggestionsForQuestion: () => string[];
  handleSendSuggestion: (suggestion: string) => void;
  handleSendMessage: () => void;
  setCurrentScreen: (screen: 'LANDING' | 'SCANNING' | 'ATS_REPORT' | 'CHAT' | 'WIZARD' | 'GENERATING' | 'WORKSPACE') => void;
  profile: any;
  ORANGE_COLOR: string;
  isTyping: boolean;
  handleGenerateResume?: () => void;
}

export const SmallSpinningAIIcon: React.FC<{ ORANGE_COLOR: string }> = ({ ORANGE_COLOR }) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={{
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: ORANGE_COLOR + '15',
      alignItems: 'center',
      justifyContent: 'center',
      transform: [{ rotate }],
      borderWidth: 1,
      borderColor: ORANGE_COLOR + '40',
    }}>
      <Icon name="logo-electron" size={16} color={ORANGE_COLOR} />
    </Animated.View>
  );
};

export const AiProfileCoPilot: React.FC<AiProfileCoPilotProps> = ({
  currentQuestionKey,
  chatMessages,
  inputText,
  setInputText,
  isKeyboardVisible,
  colors,
  isDark,
  getSuggestionsForQuestion,
  handleSendSuggestion,
  handleSendMessage,
  setCurrentScreen,
  profile,
  ORANGE_COLOR,
  isTyping,
  handleGenerateResume,
}) => {
  const [isInitializing, setIsInitializing] = useState(true);
  const spinAnim = useRef(new Animated.Value(0)).current;
  const chatScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Loop Spinning AI Icon Animation
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Fast 1.4 second transition loader
    const timeout = setTimeout(() => {
      setIsInitializing(false);
    }, 1400);

    return () => clearTimeout(timeout);
  }, []);

  // Auto-scroll to end on new messages
  useEffect(() => {
    if (!isInitializing) {
      setTimeout(() => {
        chatScrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [chatMessages, isInitializing]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {isInitializing ? (
        <View style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {/* Centered Rotating AI Icon */}
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Icon name="logo-electron" size={72} color={ORANGE_COLOR} />
          </Animated.View>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          {/* Chat Header Bar */}
          <View style={[styles.chatHeader, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
            {/* Back Button */}
            <Pressable
              onPress={() => setCurrentScreen('ATS_REPORT')}
              style={({ pressed }) => ({
                width: 36,
                height: 36,
                borderRadius: 18,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: pressed ? colors.border + '40' : 'transparent',
                marginRight: 4,
              })}
            >
              <Icon name="arrow-back" size={22} color={colors.textPrimary} />
            </Pressable>
            <View style={[styles.avatarDot, { backgroundColor: ORANGE_COLOR + '20' }]}>
              <Icon name="logo-electron" size={18} color={ORANGE_COLOR} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[typography.labelMedium, { color: colors.textPrimary, fontWeight: 'bold' }]}>
                JobIndia AI Assistant
              </Text>
              <Text style={[typography.tiny, { color: colors.textSecondary, marginTop: 1 }]}>
                AI Profile Co-Pilot
              </Text>
            </View>
          </View>

          <ScrollView
            ref={chatScrollRef}
            style={styles.chatScroll}
            contentContainerStyle={{ paddingVertical: 16 }}
          >
            {chatMessages.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.chatBubbleContainer,
                  msg.sender === 'user' ? styles.bubbleRight : styles.bubbleLeft,
                ]}
              >
                {/* AI Avatar Icon for AI messages */}
                {msg.sender === 'ai' && (
                  <View style={{ marginRight: 8, justifyContent: 'flex-end', marginBottom: 4 }}>
                    <SmallSpinningAIIcon ORANGE_COLOR={ORANGE_COLOR} />
                  </View>
                )}

                <View
                  style={[
                    styles.chatBubble,
                    msg.sender === 'user'
                      ? { backgroundColor: ORANGE_COLOR }
                      : { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
                  ]}
                >
                  <Text
                    style={[
                      typography.body,
                      msg.sender === 'user' ? { color: '#fff' } : { color: colors.textPrimary },
                    ]}
                  >
                    {msg.text}
                  </Text>
                </View>
              </View>
            ))}

            {isTyping && (
              <View style={[styles.chatBubbleContainer, styles.bubbleLeft]}>
                <View style={{ marginRight: 8, justifyContent: 'flex-end', marginBottom: 4 }}>
                  <SmallSpinningAIIcon ORANGE_COLOR={ORANGE_COLOR} />
                </View>
                <View style={[styles.chatBubble, { backgroundColor: colors.surface, paddingVertical: 10 }]}>
                  <ActivityIndicator size="small" color={ORANGE_COLOR} />
                </View>
              </View>
            )}
          </ScrollView>

          {/* Dynamic Suggestion Pills for Chat Questions */}
          {currentQuestionKey !== 'complete' && getSuggestionsForQuestion().length > 0 && (
            <View style={{ paddingVertical: 8, paddingHorizontal: 12 }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {getSuggestionsForQuestion().map((suggestion, idx) => (
                  <Pressable
                    key={idx}
                    onPress={() => handleSendSuggestion(suggestion)}
                    style={({ pressed }) => [
                      {
                        backgroundColor: colors.surface,
                        borderColor: ORANGE_COLOR + '60',
                        borderWidth: 1.2,
                        borderRadius: 20,
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        elevation: 2,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.1,
                        shadowRadius: 2,
                        opacity: pressed ? 0.8 : 1,
                      }
                    ]}
                  >
                    <Text style={[typography.tiny, { color: colors.textPrimary, fontWeight: 'bold' }]}>
                      {suggestion}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          {currentQuestionKey !== 'complete' ? (
            <View style={[styles.inputBar, { borderTopColor: colors.border, marginBottom: isKeyboardVisible ? 40 : 120 }]}>
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder="Type your answer here..."
                placeholderTextColor={colors.textPlaceholder}
                onSubmitEditing={handleSendMessage}
                style={[styles.chatInput, { color: colors.textPrimary, backgroundColor: colors.surface }]}
              />
              <Pressable onPress={handleSendMessage} style={styles.sendBtn}>
                <Icon name="send" size={20} color="#fff" />
              </Pressable>
            </View>
          ) : (
            <View style={[styles.inputBar, { borderTopColor: colors.border, justifyContent: 'center', marginBottom: isKeyboardVisible ? 40 : 120 }]}>
              <Pressable
                onPress={() => setCurrentScreen('ATS_REPORT')}
                style={[styles.primaryOrangeBtn, { width: '90%', marginTop: 0 }]}
              >
                <Text style={[typography.labelMedium, { color: '#fff', fontWeight: 'bold' }]}>
                  View Unlocked ATS Score Report 📊
                </Text>
                <Icon name="stats-chart" size={18} color="#fff" style={{ marginLeft: 6 }} />
              </Pressable>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    gap: 12,
  },
  avatarDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatScroll: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  chatBubbleContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    width: '100%',
  },
  bubbleLeft: {
    justifyContent: 'flex-start',
  },
  bubbleRight: {
    justifyContent: 'flex-end',
  },
  chatBubble: {
    maxWidth: '75%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderTopWidth: 1,
    gap: 10,
  },
  chatInput: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FF9800',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryOrangeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FF9800',
    width: '85%',
    height: 50,
    borderRadius: 12,
    marginTop: 32,
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});
