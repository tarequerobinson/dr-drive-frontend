import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Platform, StyleSheet, TextInput, TouchableOpacity, useColorScheme } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const API_BASE_URL = 'https://dr-drive-backend.onrender.com/api';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedView = Animated.createAnimatedComponent(ThemedView);

export default function ProfileScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { signOut, user, token } = useAuth();
    
    const [profile, setProfile] = useState({
        username: '',
        email: '',
        phone: '',
        year: '',
        chassis: '',
        make: '',
        model: '',
        profileImage: null,
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editedProfile, setEditedProfile] = useState(profile);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Load user data on mount
    useEffect(() => {
        if (user) {
            const userData = {
                username: user.username || '',
                email: user.email || '',
                phone: user.phone || '',
                year: user.year?.toString() || '',
                chassis: user.chassis || '',
                make: user.make || '',
                model: user.model || '',
                profileImage: null,
            };
            setProfile(userData);
            setEditedProfile(userData);
        }
    }, [user]);

    // Request permissions on mount
    useEffect(() => {
        (async () => {
            if (Platform.OS !== 'web') {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                    console.log('Media library permission not granted');
                }
            }
        })();
    }, []);

    const pickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert(
                    'Permission Required',
                    'Please grant photo library access to change your profile picture.',
                    [{ text: 'OK' }]
                );
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });

            if (!result.canceled) {
                setEditedProfile({ ...editedProfile, profileImage: result.assets[0].uri });
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image. Please try again.');
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Prepare update payload
            const updateData: any = {
                username: editedProfile.username,
                email: editedProfile.email,
                phone: editedProfile.phone,
            };

            // Add vehicle info if provided
            if (editedProfile.year) {
                updateData.year = parseInt(editedProfile.year);
            }
            if (editedProfile.make) {
                updateData.make = editedProfile.make;
            }
            if (editedProfile.model) {
                updateData.model = editedProfile.model;
            }
            if (editedProfile.chassis) {
                updateData.chassis = editedProfile.chassis;
            }

            console.log('Updating profile:', updateData);

            const response = await fetch(`${API_BASE_URL}/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(updateData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update profile');
            }

            if (data.success) {
                setProfile(editedProfile);
                setIsEditing(false);
                
                // Update auth context with new token if provided
                if (data.token) {
                    // You might want to update the auth context here
                    console.log('New token received:', data.token);
                }

                Alert.alert('Success', 'Profile updated successfully');
            } else {
                throw new Error(data.error || 'Failed to update profile');
            }
        } catch (error: any) {
            console.error('Update profile error:', error);
            Alert.alert('Error', error.message || 'Failed to update profile. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setEditedProfile(profile);
        setIsEditing(false);
    };

    const handleInputChange = (field: string, value: string) => {
        setEditedProfile({ ...editedProfile, [field]: value });
    };

    const getVehicleDisplay = () => {
        if (profile.year && profile.make && profile.model) {
            return `${profile.year} ${profile.make} ${profile.model}`;
        }
        return 'No vehicle information';
    };

    return (
        <ParallaxScrollView
            headerBackgroundColor={{ light: '#f5f5f5', dark: '#1a1a1a' }}
            headerImage={
                editedProfile.profileImage ? (
                    <Image
                        source={{ uri: editedProfile.profileImage }}
                        style={styles.profileImage}
                    />
                ) : (
                    <IconSymbol
                        size={310}
                        color={isDark ? '#fff' : '#000'}
                        name="person.crop.circle"
                        style={styles.headerImage}
                    />
                )
            }>
            <AnimatedView 
                entering={FadeInDown.duration(400)}
                style={styles.titleContainer}
            >
                <ThemedText
                    type="title"
                    style={{
                        fontFamily: Fonts.rounded,
                        fontWeight: '800',
                    }}>
                    Profile Settings
                </ThemedText>
                {!isEditing && (
                    <ThemedText style={[styles.vehicleSubtitle, isDark && styles.vehicleSubtitleDark]}>
                        {getVehicleDisplay()}
                    </ThemedText>
                )}
            </AnimatedView>

            {isEditing && (
                <AnimatedView 
                    entering={FadeInUp.delay(200)}
                    style={styles.imagePickerContainer}
                >
                    <TouchableOpacity
                        style={[styles.changePhotoButton, isDark && styles.changePhotoButtonDark]}
                        onPress={pickImage}>
                        <ThemedText style={styles.changePhotoText}>Change Profile Photo</ThemedText>
                    </TouchableOpacity>
                </AnimatedView>
            )}

            <AnimatedView 
                entering={FadeInUp.delay(300)}
                style={styles.section}
            >
                <ThemedText style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                    Personal Information
                </ThemedText>
                
                <ThemedView style={styles.inputGroup}>
                    <ThemedText style={styles.label}>Username</ThemedText>
                    {isEditing ? (
                        <TextInput
                            style={[styles.input, isDark && styles.inputDark]}
                            value={editedProfile.username}
                            onChangeText={(value) => handleInputChange('username', value)}
                            placeholder="Username"
                            placeholderTextColor={isDark ? '#888' : '#999'}
                        />
                    ) : (
                        <ThemedText style={[styles.displayValue, isDark && styles.displayValueDark]}>
                            {profile.username}
                        </ThemedText>
                    )}
                </ThemedView>

                <ThemedView style={styles.inputGroup}>
                    <ThemedText style={styles.label}>Email</ThemedText>
                    {isEditing ? (
                        <TextInput
                            style={[styles.input, isDark && styles.inputDark]}
                            value={editedProfile.email}
                            onChangeText={(value) => handleInputChange('email', value)}
                            placeholder="Email address"
                            placeholderTextColor={isDark ? '#888' : '#999'}
                            keyboardType="email-address"
                        />
                    ) : (
                        <ThemedText style={[styles.displayValue, isDark && styles.displayValueDark]}>
                            {profile.email}
                        </ThemedText>
                    )}
                </ThemedView>

                <ThemedView style={styles.inputGroup}>
                    <ThemedText style={styles.label}>Phone</ThemedText>
                    {isEditing ? (
                        <TextInput
                            style={[styles.input, isDark && styles.inputDark]}
                            value={editedProfile.phone}
                            onChangeText={(value) => handleInputChange('phone', value)}
                            placeholder="Phone number"
                            placeholderTextColor={isDark ? '#888' : '#999'}
                            keyboardType="phone-pad"
                        />
                    ) : (
                        <ThemedText style={[styles.displayValue, isDark && styles.displayValueDark]}>
                            {profile.phone || 'Not provided'}
                        </ThemedText>
                    )}
                </ThemedView>
            </AnimatedView>

            <AnimatedView 
                entering={FadeInUp.delay(400)}
                style={styles.section}
            >
                <ThemedText style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                    Vehicle Information
                </ThemedText>
                
                <ThemedView style={styles.inputGroup}>
                    <ThemedText style={styles.label}>Year</ThemedText>
                    {isEditing ? (
                        <TextInput
                            style={[styles.input, isDark && styles.inputDark]}
                            value={editedProfile.year}
                            onChangeText={(value) => handleInputChange('year', value.replace(/[^0-9]/g, ''))}
                            placeholder="e.g., 2020"
                            placeholderTextColor={isDark ? '#888' : '#999'}
                            keyboardType="numeric"
                            maxLength={4}
                        />
                    ) : (
                        <ThemedText style={[styles.displayValue, isDark && styles.displayValueDark]}>
                            {profile.year || 'Not provided'}
                        </ThemedText>
                    )}
                </ThemedView>

                <ThemedView style={styles.inputGroup}>
                    <ThemedText style={styles.label}>Make</ThemedText>
                    {isEditing ? (
                        <TextInput
                            style={[styles.input, isDark && styles.inputDark]}
                            value={editedProfile.make}
                            onChangeText={(value) => handleInputChange('make', value)}
                            placeholder="e.g., Toyota"
                            placeholderTextColor={isDark ? '#888' : '#999'}
                        />
                    ) : (
                        <ThemedText style={[styles.displayValue, isDark && styles.displayValueDark]}>
                            {profile.make || 'Not provided'}
                        </ThemedText>
                    )}
                </ThemedView>

                <ThemedView style={styles.inputGroup}>
                    <ThemedText style={styles.label}>Model</ThemedText>
                    {isEditing ? (
                        <TextInput
                            style={[styles.input, isDark && styles.inputDark]}
                            value={editedProfile.model}
                            onChangeText={(value) => handleInputChange('model', value)}
                            placeholder="e.g., Camry"
                            placeholderTextColor={isDark ? '#888' : '#999'}
                        />
                    ) : (
                        <ThemedText style={[styles.displayValue, isDark && styles.displayValueDark]}>
                            {profile.model || 'Not provided'}
                        </ThemedText>
                    )}
                </ThemedView>

                <ThemedView style={styles.inputGroup}>
                    <ThemedText style={styles.label}>Chassis Number</ThemedText>
                    {isEditing ? (
                        <TextInput
                            style={[styles.input, isDark && styles.inputDark]}
                            value={editedProfile.chassis}
                            onChangeText={(value) => handleInputChange('chassis', value)}
                            placeholder="Vehicle chassis/VIN"
                            placeholderTextColor={isDark ? '#888' : '#999'}
                            autoCapitalize="characters"
                        />
                    ) : (
                        <ThemedText style={[styles.displayValue, isDark && styles.displayValueDark]}>
                            {profile.chassis || 'Not provided'}
                        </ThemedText>
                    )}
                </ThemedView>
            </AnimatedView>

            <AnimatedView 
                entering={FadeInUp.delay(500)}
                style={styles.buttonContainer}
            >
                {!isEditing ? (
                    <ThemedView>
                        <TouchableOpacity
                            style={[styles.editButton, isDark && styles.editButtonDark]}
                            onPress={() => setIsEditing(true)}>
                            <ThemedText style={styles.buttonText}>Edit Profile</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.editButton, styles.logoutButton]}
                            onPress={signOut}>
                            <ThemedText style={styles.buttonText}>Logout</ThemedText>
                        </TouchableOpacity>
                    </ThemedView>
                ) : (
                    <ThemedView style={styles.buttonRow}>
                        <TouchableOpacity
                            style={[
                                styles.button, 
                                styles.saveButton, 
                                isDark && styles.saveButtonDark,
                                isSaving && styles.buttonDisabled
                            ]}
                            onPress={handleSave}
                            disabled={isSaving}>
                            {isSaving ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <ThemedText style={styles.buttonText}>Save Changes</ThemedText>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton, isDark && styles.cancelButtonDark]}
                            onPress={handleCancel}
                            disabled={isSaving}>
                            <ThemedText style={[styles.cancelButtonText, isDark && styles.cancelButtonTextDark]}>
                                Cancel
                            </ThemedText>
                        </TouchableOpacity>
                    </ThemedView>
                )}
            </AnimatedView>
            
        </ParallaxScrollView>
    );
}

const styles = StyleSheet.create({
    headerImage: {
        color: '#808080',
        bottom: -90,
        left: -35,
        position: 'absolute',
    },
    profileImage: {
        width: 310,
        height: 310,
        borderRadius: 155,
        bottom: -90,
        left: -35,
        position: 'absolute',
    },
    titleContainer: {
        gap: 4,
        marginBottom: 24,
    },
    vehicleSubtitle: {
        fontSize: 16,
        color: '#666',
        fontFamily: Fonts.rounded,
        fontWeight: '600',
    },
    vehicleSubtitleDark: {
        color: '#999',
    },
    imagePickerContainer: {
        marginBottom: 24,
        alignItems: 'center',
    },
    changePhotoButton: {
        backgroundColor: '#000',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
    },
    changePhotoButtonDark: {
        backgroundColor: '#fff',
    },
    changePhotoText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
        fontFamily: Fonts.rounded,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '800',
        marginBottom: 20,
        textTransform: 'uppercase',
        color: '#666',
        letterSpacing: 1,
        fontFamily: Fonts.rounded,
    },
    sectionTitleDark: {
        color: '#888',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        fontFamily: Fonts.rounded,
    },
    input: {
        borderWidth: 2,
        borderColor: '#e0e0e0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        backgroundColor: '#f5f5f5',
        fontFamily: Fonts.rounded,
    },
    inputDark: {
        borderColor: '#333',
        backgroundColor: '#1a1a1a',
        color: '#fff',
    },
    displayValue: {
        fontSize: 16,
        paddingVertical: 14,
        paddingHorizontal: 16,
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#e0e0e0',
        fontFamily: Fonts.rounded,
    },
    displayValueDark: {
        backgroundColor: '#1a1a1a',
        borderColor: '#333',
        color: '#fff',
    },
    buttonContainer: {
        marginTop: 24,
        marginBottom: 40,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
    },
    button: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    editButton: {
        backgroundColor: '#000',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    editButtonDark: {
        backgroundColor: '#fff',
    },
    saveButton: {
        backgroundColor: '#000',
    },
    saveButtonDark: {
        backgroundColor: '#fff',
    },
    cancelButton: {
        backgroundColor: '#f5f5f5',
        borderWidth: 2,
        borderColor: '#e0e0e0',
    },
    cancelButtonDark: {
        backgroundColor: '#262626',
        borderColor: '#333',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        fontFamily: Fonts.rounded,
    },
    cancelButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '700',
        fontFamily: Fonts.rounded,
    },
    cancelButtonTextDark: {
        color: '#fff',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    logoutButton: {
        marginTop: 12,
        backgroundColor: '#dc3545',
    },
});