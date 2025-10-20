import { Image } from 'expo-image';
import { Platform, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal, View, ActivityIndicator, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const API_BASE_URL = 'https://dr-drive-backend.onrender.com/api';

interface CaptureResult {
    id: string;
    type: 'image';
    timestamp: string;
    content: string;
    uri?: string;
}

export default function HomeScreen() {
    const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
    const [problemDescription, setProblemDescription] = useState('');
    const [result, setResult] = useState<{ problem: string; solution: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showCameraModal, setShowCameraModal] = useState(false);
    const [recentCaptures, setRecentCaptures] = useState<CaptureResult[]>([
        {
            id: '1',
            type: 'image',
            timestamp: 'Today 2:30 PM',
            content: 'Leaking pipe under kitchen sink',
        },
        {
            id: '2',
            type: 'image',
            timestamp: 'Today 1:15 PM',
            content: 'The AC unit is making a strange noise and not cooling properly...',
        },
        {
            id: '3',
            type: 'image',
            timestamp: 'Yesterday 4:20 PM',
            content: 'Cracked bathroom tile',
        },
    ]);

    // Request permissions on mount
    useEffect(() => {
        (async () => {
            if (Platform.OS !== 'web') {
                // Request camera permissions
                const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
                if (cameraStatus.status !== 'granted') {
                    console.log('Camera permission not granted');
                }

                // Request media library permissions
                const mediaStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (mediaStatus.status !== 'granted') {
                    console.log('Media library permission not granted');
                }
            }
        })();
    }, []);

    // Get JWT token from storage
    const getAuthToken = async (): Promise<string | null> => {
        try {
            return await AsyncStorage.getItem('auth_token');
        } catch (error) {
            console.error('Error getting auth token:', error);
            return null;
        }
    };

    // Format response from backend
    const formatResponse = (text: string): string => {
        return text
            .replace(/\*\*/g, '') // Remove markdown bold
            .replace(/\*/g, '•') // Convert asterisks to bullets
            .trim();
    };

    // Send request to backend
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
            // Check permission first
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
            // Check permission first
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
                const newCapture: CaptureResult = {
                    id: `img-${Date.now()}`,
                    type: 'image',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    content: 'Photo captured - ready for analysis',
                    uri: result.assets[0].uri,
                };
                setRecentCaptures([newCapture, ...recentCaptures]);
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

    const CaptureModal = ({ visible, title, onClose, onCapture }: any) => (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.modalOverlay}>
                <ThemedView style={styles.modalContent}>
                    <ThemedText style={styles.modalTitle}>{title}</ThemedText>

                    <TouchableOpacity
                        onPress={onCapture}
                        style={styles.captureButton}
                    >
                        <ThemedText style={styles.captureButtonText}>
                            Take Photo
                        </ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
                        <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
                    </TouchableOpacity>
                </ThemedView>
            </View>
        </Modal>
    );

    const CaptureItem = ({ item }: { item: CaptureResult }) => (
        <TouchableOpacity
            onPress={() => setProblemDescription(item.content)}
            style={styles.captureItem}
        >
            <ThemedView style={[styles.captureIcon, { backgroundColor: '#E8F5FF' }]}>
                <ThemedText style={styles.captureEmoji}>📷</ThemedText>
            </ThemedView>
            <ThemedView style={styles.captureInfo}>
                <ThemedText style={styles.captureTitle}>Photo Capture</ThemedText>
                <ThemedText style={styles.captureDescription} numberOfLines={1}>
                    {item.content}
                </ThemedText>
                <ThemedText style={styles.captureTime}>
                    {item.timestamp}
                </ThemedText>
            </ThemedView>
        </TouchableOpacity>
    );

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            {!result ? (
                <ThemedView style={styles.wrapper}>
                    <ThemedView style={styles.centerContent}>
                        <ThemedView style={styles.header}>
                            <ThemedText type="title" style={styles.title}>
                                Hi, how can we help?
                            </ThemedText>
                            <ThemedText style={styles.subtitle}>Describe your issue or capture a photo</ThemedText>
                        </ThemedView>

                        <ThemedView style={styles.quickActionsContainer}>
                            <TouchableOpacity
                                style={styles.quickActionButton}
                                onPress={() => setShowCameraModal(true)}
                            >
                                <ThemedText style={styles.quickActionEmoji}>📷</ThemedText>
                                <ThemedText style={styles.quickActionText}>Take Photo</ThemedText>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.quickActionButton}
                                onPress={handlePickImage}
                            >
                                <ThemedText style={styles.quickActionEmoji}>📁</ThemedText>
                                <ThemedText style={styles.quickActionText}>Upload</ThemedText>
                            </TouchableOpacity>
                        </ThemedView>

                        <ThemedView style={styles.inputContainer}>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Describe the issue here..."
                                placeholderTextColor="#999"
                                value={problemDescription}
                                onChangeText={setProblemDescription}
                                multiline
                                numberOfLines={4}
                            />

                            {selectedMedia && (
                                <ThemedView style={styles.mediaPreview}>
                                    <Image
                                        source={{ uri: selectedMedia }}
                                        style={styles.previewImage}
                                    />
                                    <TouchableOpacity
                                        style={styles.removeMediaButton}
                                        onPress={() => setSelectedMedia(null)}
                                    >
                                        <ThemedText style={styles.removeText}>✕</ThemedText>
                                    </TouchableOpacity>
                                </ThemedView>
                            )}
                        </ThemedView>
                    </ThemedView>

                    <TouchableOpacity
                        style={[styles.submitButton, isLoading && styles.submitButtonLoading]}
                        onPress={handleSubmitProblem}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <ThemedText style={styles.submitButtonText}>Get Solution</ThemedText>
                        )}
                    </TouchableOpacity>
                </ThemedView>
            ) : (
                <ThemedView style={styles.wrapper}>
                    <ThemedView style={styles.resultContainer}>
                        <ThemedView style={styles.resultContent}>
                            <ThemedText style={styles.resultLabel}>Problem</ThemedText>
                            <ThemedText style={styles.resultText}>{result.problem}</ThemedText>
                        </ThemedView>

                        <ThemedView style={styles.divider} />

                        <ThemedView style={styles.resultContent}>
                            <ThemedText style={styles.resultLabel}>Solution</ThemedText>
                            <ThemedText style={styles.resultText}>{result.solution}</ThemedText>
                        </ThemedView>
                    </ThemedView>

                    <TouchableOpacity
                        style={styles.newButton}
                        onPress={() => setResult(null)}
                    >
                        <ThemedText style={styles.newButtonText}>Try another</ThemedText>
                    </TouchableOpacity>
                </ThemedView>
            )}

            <CaptureModal
                visible={showCameraModal}
                title="Take a Photo"
                onClose={() => setShowCameraModal(false)}
                onCapture={handleTakePhoto}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
    },
    wrapper: {
        width: '100%',
        maxWidth: 500,
        paddingHorizontal: 20,
        paddingVertical: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerContent: {
        width: '100%',
        alignItems: 'center',
        gap: 20,
    },
    header: {
        marginBottom: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        letterSpacing: -0.5,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#777',
        marginTop: 6,
        fontWeight: '500',
        textAlign: 'center',
    },
    quickActionsContainer: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 20,
        justifyContent: 'center',
        width: '100%',
    },
    quickActionButton: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        gap: 4,
        maxWidth: 150,
    },
    quickActionEmoji: {
        fontSize: 24,
    },
    quickActionText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
    },
    inputContainer: {
        marginBottom: 0,
        gap: 12,
        width: '100%',
    },
    textInput: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#f5f5f5',
        fontSize: 16,
        color: '#000',
        minHeight: 100,
        textAlignVertical: 'top',
        width: '100%',
    },
    mediaPreview: {
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
        marginTop: 4,
        width: '100%',
    },
    previewImage: {
        width: '100%',
        height: 200,
        borderRadius: 12,
    },
    removeMediaButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    captureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        padding: 12,
        gap: 12,
    },
    captureIcon: {
        width: 44,
        height: 44,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureEmoji: {
        fontSize: 22,
    },
    captureInfo: {
        flex: 1,
        gap: 2,
    },
    captureTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
    },
    captureDescription: {
        fontSize: 12,
        color: '#666',
        lineHeight: 16,
    },
    captureTime: {
        fontSize: 11,
        color: '#999',
    },
    submitButton: {
        backgroundColor: '#000',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
        width: '100%',
    },
    submitButtonLoading: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    resultContainer: {
        backgroundColor: '#f9f9f9',
        borderRadius: 16,
        padding: 24,
        marginBottom: 20,
        width: '100%',
    },
    resultContent: {
        gap: 8,
    },
    resultLabel: {
        fontSize: 13,
        color: '#999',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    resultText: {
        fontSize: 16,
        lineHeight: 24,
        color: '#000',
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#e5e5e5',
        marginVertical: 16,
    },
    newButton: {
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e5e5',
        alignItems: 'center',
        width: '100%',
    },
    newButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 24,
        paddingBottom: 40,
        gap: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 8,
    },
    captureButton: {
        backgroundColor: '#000',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    captureButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    cancelButton: {
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e5e5',
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
});