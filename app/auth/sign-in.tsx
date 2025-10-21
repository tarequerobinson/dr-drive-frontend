import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, TextInput, TouchableOpacity, useColorScheme } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedView = Animated.createAnimatedComponent(ThemedView);

const TEST_CREDENTIALS = {
    username: 'testuser',
    password: 'test123',
};

export default function SignInScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    
    const [credentials, setCredentials] = useState({
        username: '',
        password: '',
    });
    const [isLoading, setIsLoading] = useState(false);

    const { signIn } = useAuth();

    const handleSignIn = async () => {
        if (!credentials.username || !credentials.password) {
            Alert.alert('Error', 'Please enter both username and password');
            return;
        }

        setIsLoading(true);
        try {
            await signIn(credentials.username, credentials.password);
            // Navigation will be handled by auth context
        } catch (error: any) {
            Alert.alert('Sign In Failed', error.message || 'Invalid username or password');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUseTestCredentials = () => {
        setCredentials(TEST_CREDENTIALS);
    };

    return (
        <ThemedView style={styles.container}>
            <AnimatedView 
                entering={FadeInDown.duration(600)}
                style={styles.headerSection}
            >
                <IconSymbol
                    size={100}
                    color={isDark ? '#fff' : '#000'}
                    name="person.circle.fill"
                    style={styles.icon}
                />
                <ThemedText style={styles.title}>Welcome Back</ThemedText>
                <ThemedText style={[styles.subtitle, isDark && styles.subtitleDark]}>
                    Sign in to continue
                </ThemedText>
            </AnimatedView>

            <AnimatedView 
                entering={FadeInUp.delay(200).duration(600)}
                style={styles.testCredentials}
            >
                <ThemedText style={styles.testTitle}>Test Credentials</ThemedText>
                <TouchableOpacity onPress={handleUseTestCredentials}>
                    <ThemedText style={[styles.testText, isDark && styles.testTextDark]}>
                        Username: {TEST_CREDENTIALS.username}
                    </ThemedText>
                    <ThemedText style={[styles.testText, isDark && styles.testTextDark]}>
                        Password: {TEST_CREDENTIALS.password}
                    </ThemedText>
                    <ThemedText style={styles.testHint}>Tap to use</ThemedText>
                </TouchableOpacity>
            </AnimatedView>

            <AnimatedView 
                entering={FadeInUp.delay(400).duration(600)}
                style={styles.form}
            >
                <ThemedView style={styles.inputContainer}>
                    <ThemedText style={styles.label}>Username</ThemedText>
                    <TextInput
                        style={[styles.input, isDark && styles.inputDark]}
                        value={credentials.username}
                        onChangeText={(text) => setCredentials({ ...credentials, username: text })}
                        placeholder="Enter your username"
                        placeholderTextColor={isDark ? '#888' : '#999'}
                        autoCapitalize="none"
                        editable={!isLoading}
                    />
                </ThemedView>

                <ThemedView style={styles.inputContainer}>
                    <ThemedText style={styles.label}>Password</ThemedText>
                    <TextInput
                        style={[styles.input, isDark && styles.inputDark]}
                        value={credentials.password}
                        onChangeText={(text) => setCredentials({ ...credentials, password: text })}
                        placeholder="Enter your password"
                        placeholderTextColor={isDark ? '#888' : '#999'}
                        secureTextEntry
                        editable={!isLoading}
                    />
                </ThemedView>

                <TouchableOpacity
                    style={[
                        styles.button, 
                        isDark && styles.buttonDark,
                        isLoading && styles.buttonDisabled
                    ]}
                    onPress={handleSignIn}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <ThemedText style={styles.buttonText}>Sign In</ThemedText>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.linkButton}
                    onPress={() => router.push('/auth/sign-up')}
                    disabled={isLoading}
                >
                    <ThemedText style={[styles.linkText, isDark && styles.linkTextDark]}>
                        Don't have an account? <ThemedText style={styles.linkTextBold}>Sign Up</ThemedText>
                    </ThemedText>
                </TouchableOpacity>
            </AnimatedView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    headerSection: {
        alignItems: 'center',
        marginBottom: 30,
    },
    icon: {
        marginBottom: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        marginBottom: 8,
        fontFamily: Fonts.rounded,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        fontFamily: Fonts.rounded,
    },
    subtitleDark: {
        color: '#999',
    },
    testCredentials: {
        padding: 20,
        borderRadius: 16,
        marginBottom: 30,
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderWidth: 2,
        borderColor: '#e0e0e0',
    },
    testTitle: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 12,
        fontFamily: Fonts.rounded,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    testText: {
        fontSize: 14,
        marginBottom: 4,
        color: '#000',
        fontFamily: Fonts.rounded,
    },
    testTextDark: {
        color: '#fff',
    },
    testHint: {
        fontSize: 12,
        marginTop: 8,
        color: '#666',
        fontStyle: 'italic',
    },
    form: {
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        fontFamily: Fonts.rounded,
    },
    input: {
        height: 56,
        padding: 16,
        fontSize: 16,
        borderRadius: 16,
        backgroundColor: '#f5f5f5',
        borderWidth: 2,
        borderColor: '#e0e0e0',
        fontFamily: Fonts.rounded,
    },
    inputDark: {
        backgroundColor: '#1a1a1a',
        borderColor: '#333',
        color: '#fff',
    },
    button: {
        height: 56,
        padding: 16,
        borderRadius: 16,
        marginTop: 10,
        marginBottom: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000',
    },
    buttonDark: {
        backgroundColor: '#fff',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 0.5,
        fontFamily: Fonts.rounded,
    },
    linkButton: {
        padding: 16,
        alignItems: 'center',
    },
    linkText: {
        fontSize: 15,
        color: '#666',
        fontFamily: Fonts.rounded,
    },
    linkTextDark: {
        color: '#999',
    },
    linkTextBold: {
        fontWeight: '700',
        color: '#000',
    },
});