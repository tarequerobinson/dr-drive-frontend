import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, useColorScheme } from 'react-native';
import Animated, {
    BounceIn,
    Easing,
    FadeIn,
    FadeInDown,
    FadeInUp,
    FadeOut,
    SlideInLeft,
    SlideInRight,
    ZoomIn,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

const API_BASE_URL = 'https://dr-drive-backend.onrender.com/api';

interface CaptureResult {
    id: string;
    type: 'image';
    timestamp: string;
    content: string;
    uri?: string;
}

// Icon Components with dynamic colors
const CameraIcon = ({ size = 24, color = '#000' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <Circle cx="12" cy="13" r="4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
);

const FolderIcon = ({ size = 24, color = '#000' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M22 19C22 19.5304 21.7893 20.0391 21.4142 20.4142C21.0391 20.7893 20.5304 21 20 21H4C3.46957 21 2.96086 20.7893 2.58579 20.4142C2.21071 20.0391 2 19.5304 2 19V5C2 4.46957 2.21071 3.96086 2.58579 3.58579C2.96086 3.21071 3.46957 3 4 3H9L11 6H20C20.5304 6 21.0391 6.21071 21.4142 6.58579C21.7893 6.96086 22 7.46957 22 8V19Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
);

const CloseIcon = ({ size = 24, color = '#fff' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Line x1="18" y1="6" x2="6" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        <Line x1="6" y1="6" x2="18" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </Svg>
);

const ImageIcon = ({ size = 24, color = '#000' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth="2"/>
        <Circle cx="8.5" cy="8.5" r="1.5" fill={color}/>
        <Path d="M21 15L16 10L5 21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
);

const CheckIcon = ({ size = 24, color = '#000' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M20 6L9 17L4 12" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
);

const CarIcon = ({ size = 32, color = '#000' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M5 11L7 5H17L19 11M5 11V17H19V11M5 11H19" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <Circle cx="7.5" cy="17" r="2" stroke={color} strokeWidth="2"/>
        <Circle cx="16.5" cy="17" r="2" stroke={color} strokeWidth="2"/>
    </Svg>
);

const WrenchIcon = ({ size = 24, color = '#000' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
);

const SpeedometerIcon = ({ size = 24, color = '#000' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" stroke={color} strokeWidth="1.5"/>
        <Path d="M12 6v6l4 2" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </Svg>
);

// Animated components
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedView = Animated.createAnimatedComponent(ThemedView);

export default function HomeScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    
    const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
    const [problemDescription, setProblemDescription] = useState('');
    const [result, setResult] = useState<{ problem: string; solution: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showCameraModal, setShowCameraModal] = useState(false);
    
    // Get user data from context
    const { user } = require('@/contexts/auth-context').useAuth();
    
    const getUserGreeting = () => {
        if (user?.username) {
            return `Hi ${user.username}!`;
        }
        return 'Vehicle Diagnostics';
    };
    
    const getVehicleContext = () => {
        if (user?.year && user?.make && user?.model) {
            return `${user.year} ${user.make} ${user.model}`;
        }
        return null;
    };

    // Animation values
    const pulseScale = useSharedValue(1);

    useEffect(() => {
        // Pulse animation for loading
        if (isLoading) {
            pulseScale.value = withRepeat(
                withSequence(
                    withTiming(1.05, { duration: 800, easing: Easing.inOut(Easing.ease) }),
                    withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                false
            );
        } else {
            pulseScale.value = withTiming(1, { duration: 300 });
        }
    }, [isLoading]);

    useEffect(() => {
        (async () => {
            if (Platform.OS !== 'web') {
                const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
                if (cameraStatus.status !== 'granted') {
                    console.log('Camera permission not granted');
                }

                const mediaStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (mediaStatus.status !== 'granted') {
                    console.log('Media library permission not granted');
                }
            }
        })();
    }, []);

    const getAuthToken = async (): Promise<string | null> => {
        try {
            return await AsyncStorage.getItem('auth_token');
        } catch (error) {
            console.error('Error getting auth token:', error);
            return null;
        }
    };

    const formatResponse = (text: string): string => {
        return text
            .replace(/\*\*/g, '')
            .replace(/\*/g, '•')
            .trim();
    };

    const sendDiagnosisRequest = async (prompt: string, imageUri?: string) => {
        const token = await getAuthToken();

        const formData = new FormData();
        formData.append('prompt', prompt);

        if (imageUri) {
            const uriParts = imageUri.split('.');
            const fileType = uriParts[uriParts.length - 1];

            formData.append('images', {
                uri: imageUri,
                name: `photo.${fileType}`,
                type: `image/${fileType}`,
            } as any);
        }

        const response = await fetch(`${API_BASE_URL}/generate`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to get diagnosis');
        }

        return await response.json();
    };

    const handlePickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert(
                    'Permission Required',
                    'Please grant photo library access to upload images.',
                    [{ text: 'OK' }]
                );
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 1,
            });

            if (!result.canceled) {
                setSelectedMedia(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image. Please try again.');
        }
    };

    const handleTakePhoto = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert(
                    'Permission Required',
                    'Please grant camera access to take photos.',
                    [{ text: 'OK' }]
                );
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                quality: 1,
            });

            if (!result.canceled) {
                setSelectedMedia(result.assets[0].uri);
                setShowCameraModal(false);
            }
        } catch (error) {
            console.error('Error taking photo:', error);
            Alert.alert('Error', 'Failed to take photo. Please try again.');
        }
    };

    const handleSubmitProblem = async () => {
        if (!problemDescription && !selectedMedia) {
            Alert.alert('Input Required', 'Please describe your problem or upload media');
            return;
        }

        const finalPrompt = problemDescription || 'What mechanical issue do you see in this image? Please provide a detailed diagnosis and solution.';

        setIsLoading(true);
        try {
            const response = await sendDiagnosisRequest(finalPrompt, selectedMedia || undefined);

            if (response.success) {
                const formattedSolution = formatResponse(response.response);

                setResult({
                    problem: response.prompt,
                    solution: formattedSolution,
                });

                setProblemDescription('');
                setSelectedMedia(null);
            } else {
                Alert.alert('Error', 'Failed to get diagnosis. Please try again.');
            }
        } catch (error: any) {
            console.error('Diagnosis error:', error);

            if (error.message.includes('authentication') || error.message.includes('token')) {
                Alert.alert('Authentication Error', 'Please login to use this feature');
            } else {
                Alert.alert('Error', error.message || 'Failed to process your request. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const pulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseScale.value }],
    }));

    const CaptureModal = ({ visible, title, onClose, onCapture }: any) => (
        <Modal visible={visible} transparent animationType="none">
            <Animated.View 
                entering={FadeIn.duration(200)}
                exiting={FadeOut.duration(200)}
                style={styles.modalOverlay}
            >
                <AnimatedView 
                    entering={SlideInRight.duration(300).springify()}
                    exiting={FadeOut.duration(200)}
                    style={[styles.modalContent, isDark && styles.modalContentDark]}
                >
                    <AnimatedView 
                        entering={BounceIn.delay(200)}
                        style={styles.modalHeader}
                    >
                        <CarIcon size={40} color={isDark ? '#fff' : '#000'} />
                        <ThemedText style={styles.modalTitle}>{title}</ThemedText>
                    </AnimatedView>

                    <AnimatedTouchable
                        entering={FadeInUp.delay(300)}
                        onPress={onCapture}
                        style={[styles.captureButton, isDark && styles.captureButtonDark]}
                    >
                        <CameraIcon size={20} color="#fff" />
                        <ThemedText style={styles.captureButtonText}>
                            Capture Issue
                        </ThemedText>
                    </AnimatedTouchable>

                    <AnimatedTouchable 
                        entering={FadeInUp.delay(400)}
                        onPress={onClose} 
                        style={[styles.cancelButton, isDark && styles.cancelButtonDark]}
                    >
                        <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
                    </AnimatedTouchable>
                </AnimatedView>
            </Animated.View>
        </Modal>
    );

    return (
        <ThemedView style={styles.container}>
            <AnimatedView 
                entering={FadeInDown.duration(400)}
                style={[styles.headerBar, isDark && styles.headerBarDark]}
            >
                <ThemedView style={styles.brandSection}>
                    <WrenchIcon size={28} color={isDark ? '#fff' : '#000'} />
                    <ThemedText style={styles.brandText}>DR. DRIVE</ThemedText>
                </ThemedView>
                <ThemedView style={[styles.accentLine, isDark && styles.accentLineDark]} />
            </AnimatedView>

            {!result ? (
                <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <ThemedView style={styles.mainContent}>
                        <AnimatedView 
                            entering={FadeIn.delay(200).duration(600)}
                            style={styles.header}
                        >
                            <ThemedView style={styles.iconHeader}>
                                <SpeedometerIcon size={48} color={isDark ? '#fff' : '#000'} />
                            </ThemedView>
                            <ThemedText type="title" style={styles.title}>
                                Vehicle Diagnostics
                            </ThemedText>
                            <ThemedText style={[styles.subtitle, isDark && styles.subtitleDark]}>
                                Capture your issue and get instant expert analysis
                            </ThemedText>
                        </AnimatedView>

                        <AnimatedView 
                            entering={SlideInLeft.delay(400).duration(500)}
                            style={styles.actionSection}
                        >
                            <AnimatedTouchable
                                entering={FadeInDown.delay(500)}
                                style={[styles.primaryAction, isDark && styles.primaryActionDark]}
                                onPress={() => setShowCameraModal(true)}
                                activeOpacity={0.85}
                            >
                                <CameraIcon size={28} color="#fff" />
                                <ThemedText style={styles.primaryActionText}>Scan Issue</ThemedText>
                                <ThemedText style={styles.actionSubtext}>Use camera to capture</ThemedText>
                            </AnimatedTouchable>

                            <AnimatedTouchable
                                entering={FadeInDown.delay(600)}
                                style={[styles.secondaryAction, isDark && styles.secondaryActionDark]}
                                onPress={handlePickImage}
                                activeOpacity={0.85}
                            >
                                <FolderIcon size={26} color={isDark ? '#fff' : '#000'} />
                                <ThemedView style={styles.actionTextContainer}>
                                    <ThemedText style={styles.secondaryActionText}>Upload Photo</ThemedText>
                                    <ThemedText style={[styles.secondarySubtext, isDark && styles.secondarySubtextDark]}>From gallery</ThemedText>
                                </ThemedView>
                            </AnimatedTouchable>
                        </AnimatedView>

                        {selectedMedia && (
                            <AnimatedView 
                                entering={ZoomIn.duration(400).springify()}
                                exiting={FadeOut.duration(200)}
                                style={styles.mediaPreviewCard}
                            >
                                <ThemedView style={styles.previewHeader}>
                                    <ThemedView style={[styles.checkBadge, isDark && styles.checkBadgeDark]}>
                                        <CheckIcon size={16} color="#fff" />
                                    </ThemedView>
                                    <ThemedText style={[styles.previewLabel, isDark && styles.previewLabelDark]}>Image Ready</ThemedText>
                                </ThemedView>
                                <ThemedView style={[styles.mediaPreview, isDark && styles.mediaPreviewDark]}>
                                    <Image
                                        source={{ uri: selectedMedia }}
                                        style={styles.previewImage}
                                    />
                                    <TouchableOpacity
                                        style={[styles.removeMediaButton, isDark && styles.removeMediaButtonDark]}
                                        onPress={() => setSelectedMedia(null)}
                                    >
                                        <CloseIcon size={18} color="#fff" />
                                    </TouchableOpacity>
                                </ThemedView>
                            </AnimatedView>
                        )}

                        <AnimatedView 
                            entering={FadeInUp.delay(700).duration(500)}
                            style={styles.inputSection}
                        >
                            <ThemedView style={styles.inputHeader}>
                                <ThemedView style={[styles.inputIndicator, isDark && styles.inputIndicatorDark]} />
                                <ThemedText style={styles.inputLabel}>
                                    Describe the Issue
                                </ThemedText>
                            </ThemedView>
                            <TextInput
                                style={[styles.textInput, isDark && styles.textInputDark]}
                                placeholder="Example: Engine making knocking sound when accelerating, check engine light is on..."
                                placeholderTextColor={isDark ? '#888' : '#999'}
                                value={problemDescription}
                                onChangeText={setProblemDescription}
                                multiline
                                numberOfLines={6}
                            />
                        </AnimatedView>
                    </ThemedView>

                    <AnimatedView 
                        entering={FadeInUp.delay(800).duration(400)}
                        style={[styles.buttonContainer, isDark && styles.buttonContainerDark]}
                    >
                        <Animated.View style={isLoading ? pulseStyle : {}}>
                            <TouchableOpacity
                                style={[
                                    styles.submitButton,
                                    isDark && styles.submitButtonDark,
                                    isLoading && styles.submitButtonLoading, 
                                    (!problemDescription && !selectedMedia) && styles.submitButtonDisabled
                                ]}
                                onPress={handleSubmitProblem}
                                disabled={isLoading || (!problemDescription && !selectedMedia)}
                                activeOpacity={0.85}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <>
                                        <WrenchIcon size={22} color="#fff" />
                                        <ThemedText style={styles.submitButtonText}>RUN DIAGNOSIS</ThemedText>
                                    </>
                                )}
                            </TouchableOpacity>
                        </Animated.View>
                    </AnimatedView>
                </ScrollView>
            ) : (
                <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <AnimatedView 
                        entering={FadeIn.duration(400)}
                        style={styles.resultWrapper}
                    >
                        <AnimatedView 
                            entering={BounceIn.delay(200)}
                            style={styles.resultHeader}
                        >
                            <ThemedView style={[styles.successBadge, isDark && styles.successBadgeDark]}>
                                <CheckIcon size={32} color="#fff" />
                            </ThemedView>
                            <ThemedText style={styles.resultHeaderText}>Diagnosis Complete</ThemedText>
                            <ThemedText style={[styles.resultSubheader, isDark && styles.resultSubheaderDark]}>Analysis report ready</ThemedText>
                        </AnimatedView>

                        <AnimatedView 
                            entering={FadeInUp.delay(400).duration(500)}
                            style={[styles.resultCard, isDark && styles.resultCardDark]}
                        >
                            <ThemedView style={styles.resultSection}>
                                <ThemedView style={styles.sectionHeader}>
                                    <ThemedView style={[styles.sectionIndicator, isDark && styles.sectionIndicatorDark]} />
                                    <ThemedText style={[styles.resultLabel, isDark && styles.resultLabelDark]}>IDENTIFIED ISSUE</ThemedText>
                                </ThemedView>
                                <ThemedText style={[styles.resultText, isDark && styles.resultTextDark]}>{result.problem}</ThemedText>
                            </ThemedView>

                            <ThemedView style={[styles.divider, isDark && styles.dividerDark]} />

                            <ThemedView style={styles.resultSection}>
                                <ThemedView style={styles.sectionHeader}>
                                    <ThemedView style={[styles.sectionIndicator, styles.sectionIndicatorSuccess, isDark && styles.sectionIndicatorSuccessDark]} />
                                    <ThemedText style={[styles.resultLabel, isDark && styles.resultLabelDark]}>RECOMMENDED FIX</ThemedText>
                                </ThemedView>
                                <ThemedText style={[styles.resultText, isDark && styles.resultTextDark]}>{result.solution}</ThemedText>
                            </ThemedView>
                        </AnimatedView>

                        <AnimatedTouchable
                            entering={FadeInUp.delay(600).duration(400)}
                            style={[styles.newButton, isDark && styles.newButtonDark]}
                            onPress={() => setResult(null)}
                            activeOpacity={0.85}
                        >
                            <CarIcon size={24} color={isDark ? '#fff' : '#000'} />
                            <ThemedText style={[styles.newButtonText, isDark && styles.newButtonTextDark]}>New Diagnosis</ThemedText>
                        </AnimatedTouchable>
                    </AnimatedView>
                </ScrollView>
            )}

            <CaptureModal
                visible={showCameraModal}
                title="Capture Vehicle Issue"
                onClose={() => setShowCameraModal(false)}
                onCapture={handleTakePhoto}
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerBar: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: '#f5f5f5',
    },
    headerBarDark: {
        backgroundColor: '#1a1a1a',
    },
    brandSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    brandText: {
        fontSize: 22,
        fontWeight: '900',
        letterSpacing: 2,
    },
    accentLine: {
        height: 3,
        backgroundColor: '#000',
        marginTop: 12,
        width: 60,
    },
    accentLineDark: {
        backgroundColor: '#fff',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    mainContent: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 30,
        paddingBottom: 20,
    },
    header: {
        marginBottom: 32,
        alignItems: 'center',
    },
    iconHeader: {
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 8,
        lineHeight: 34,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 15,
        color: '#666',
        lineHeight: 22,
        textAlign: 'center',
    },
    subtitleDark: {
        color: '#999',
    },
    actionSection: {
        gap: 14,
        marginBottom: 28,
    },
    primaryAction: {
        backgroundColor: '#000',
        paddingVertical: 24,
        paddingHorizontal: 20,
        borderRadius: 16,
        alignItems: 'center',
        gap: 8,
    },
    primaryActionDark: {
        backgroundColor: '#fff',
    },
    primaryActionText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    actionSubtext: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 13,
        fontWeight: '500',
    },
    secondaryAction: {
        backgroundColor: '#f5f5f5',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 18,
        paddingHorizontal: 20,
        borderRadius: 16,
        gap: 14,
        borderWidth: 2,
        borderColor: '#e0e0e0',
    },
    secondaryActionDark: {
        backgroundColor: '#262626',
        borderColor: '#333',
    },
    actionTextContainer: {
        flex: 1,
    },
    secondaryActionText: {
        fontSize: 17,
        fontWeight: '600',
    },
    secondarySubtext: {
        color: '#666',
        fontSize: 13,
        marginTop: 2,
    },
    secondarySubtextDark: {
        color: '#888',
    },
    mediaPreviewCard: {
        marginBottom: 28,
        gap: 12,
    },
    previewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    checkBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkBadgeDark: {
        backgroundColor: '#fff',
    },
    previewLabel: {
        fontSize: 15,
        fontWeight: '700',
        color: '#000',
        letterSpacing: 0.5,
    },
    previewLabelDark: {
        color: '#fff',
    },
    mediaPreview: {
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
        borderWidth: 2,
        borderColor: '#000',
    },
    mediaPreviewDark: {
        borderColor: '#fff',
    },
    previewImage: {
        width: '100%',
        height: 240,
        borderRadius: 14,
    },
    removeMediaButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#000',
    },
    removeMediaButtonDark: {
        backgroundColor: 'rgba(255,255,255,0.85)',
        borderColor: '#fff',
    },
    inputSection: {
        gap: 12,
    },
    inputHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    inputIndicator: {
        width: 4,
        height: 20,
        backgroundColor: '#000',
        borderRadius: 2,
    },
    inputIndicatorDark: {
        backgroundColor: '#fff',
    },
    inputLabel: {
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    textInput: {
        padding: 18,
        borderRadius: 16,
        backgroundColor: '#f5f5f5',
        fontSize: 16,
        color: '#000',
        minHeight: 140,
        textAlignVertical: 'top',
        borderWidth: 2,
        borderColor: '#e0e0e0',
    },
    textInputDark: {
        backgroundColor: '#1a1a1a',
        color: '#fff',
        borderColor: '#333',
    },
    buttonContainer: {
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderTopWidth: 2,
        borderTopColor: '#e0e0e0',
    },
    buttonContainerDark: {
        borderTopColor: '#262626',
    },
    submitButton: {
        backgroundColor: '#000',
        flexDirection: 'row',
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    submitButtonDark: {
        backgroundColor: '#fff',
    },
    submitButtonLoading: {
        opacity: 0.7,
    },
    submitButtonDisabled: {
        backgroundColor: '#ccc',
        opacity: 0.5,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '800',
        letterSpacing: 1,
    },
    resultWrapper: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 30,
        paddingBottom: 30,
    },
    resultHeader: {
        alignItems: 'center',
        marginBottom: 28,
        gap: 12,
    },
    successBadge: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    successBadgeDark: {
        backgroundColor: '#fff',
    },
    resultHeaderText: {
        fontSize: 26,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    resultSubheader: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    resultSubheaderDark: {
        color: '#888',
    },
    resultCard: {
        backgroundColor: '#f5f5f5',
        borderRadius: 20,
        padding: 24,
        marginBottom: 20,
        borderWidth: 2,
        borderColor: '#e0e0e0',
    },
    resultCardDark: {
        backgroundColor: '#1a1a1a',
        borderColor: '#262626',
    },
    resultSection: {
        gap: 14,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    sectionIndicator: {
        width: 4,
        height: 18,
        backgroundColor: '#000',
        borderRadius: 2,
    },
    sectionIndicatorDark: {
        backgroundColor: '#fff',
    },
    sectionIndicatorSuccess: {
        backgroundColor: '#666',
    },
    sectionIndicatorSuccessDark: {
        backgroundColor: '#ccc',
    },
    resultLabel: {
        fontSize: 11,
        color: '#666',
        fontWeight: '800',
        letterSpacing: 1.5,
    },
    resultLabelDark: {
        color: '#888',
    },
    resultText: {
        fontSize: 16,
        lineHeight: 26,
        color: '#000',
        fontWeight: '400',
    },
    resultTextDark: {
        color: '#e5e5e5',
    },
    divider: {
        height: 2,
        backgroundColor: '#e0e0e0',
        marginVertical: 24,
    },
    dividerDark: {
        backgroundColor: '#262626',
    },
    newButton: {
        paddingVertical: 18,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#000',
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#fff',
    },
    newButtonDark: {
        borderColor: '#fff',
        backgroundColor: '#1a1a1a',
    },
    newButtonText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#000',
        letterSpacing: 0.5,
    },
    newButtonTextDark: {
        color: '#fff',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
        gap: 20,
        backgroundColor: '#fff',
        borderTopWidth: 3,
        borderTopColor: '#000',
    },
    modalContentDark: {
        backgroundColor: '#1a1a1a',
        borderTopColor: '#fff',
    },
    modalHeader: {
        alignItems: 'center',
        gap: 12,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    captureButton: {
        backgroundColor: '#000',
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
    },
    captureButtonDark: {
        backgroundColor: '#fff',
    },
    captureButtonText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    cancelButton: {
        paddingVertical: 16,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#e0e0e0',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    cancelButtonDark: {
        backgroundColor: '#262626',
        borderColor: '#333',
    },
    cancelButtonText: {
        fontSize: 17,
        fontWeight: '600',
    },
});