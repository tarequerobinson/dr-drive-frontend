import { useState } from 'react';
import { Image, Platform, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';

export default function ProfileScreen() {
  const [profile, setProfile] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    year: '2022',
    make: 'Toyota',
    model: 'Camry',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);

  const handleSave = () => {
    setProfile(editedProfile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setEditedProfile({ ...editedProfile, [field]: value });
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="person.crop.circle"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
          }}>
          Profile Settings
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Personal Information</ThemedText>

        <ThemedView style={styles.inputGroup}>
          <ThemedText style={styles.label}>First Name</ThemedText>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={editedProfile.firstName}
              onChangeText={(value) => handleInputChange('firstName', value)}
              placeholder="First name"
            />
          ) : (
            <ThemedText style={styles.displayValue}>{profile.firstName}</ThemedText>
          )}
        </ThemedView>

        <ThemedView style={styles.inputGroup}>
          <ThemedText style={styles.label}>Last Name</ThemedText>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={editedProfile.lastName}
              onChangeText={(value) => handleInputChange('lastName', value)}
              placeholder="Last name"
            />
          ) : (
            <ThemedText style={styles.displayValue}>{profile.lastName}</ThemedText>
          )}
        </ThemedView>

        <ThemedView style={styles.inputGroup}>
          <ThemedText style={styles.label}>Email</ThemedText>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={editedProfile.email}
              onChangeText={(value) => handleInputChange('email', value)}
              placeholder="Email address"
              keyboardType="email-address"
            />
          ) : (
            <ThemedText style={styles.displayValue}>{profile.email}</ThemedText>
          )}
        </ThemedView>

        <ThemedView style={styles.inputGroup}>
          <ThemedText style={styles.label}>Phone</ThemedText>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={editedProfile.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              placeholder="Phone number"
              keyboardType="phone-pad"
            />
          ) : (
            <ThemedText style={styles.displayValue}>{profile.phone}</ThemedText>
          )}
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Vehicle Information</ThemedText>

        <ThemedView style={styles.inputGroup}>
          <ThemedText style={styles.label}>Year</ThemedText>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={editedProfile.year}
              onChangeText={(value) => handleInputChange('year', value)}
              placeholder="Year"
              keyboardType="numeric"
            />
          ) : (
            <ThemedText style={styles.displayValue}>{profile.year}</ThemedText>
          )}
        </ThemedView>

        <ThemedView style={styles.inputGroup}>
          <ThemedText style={styles.label}>Make</ThemedText>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={editedProfile.make}
              onChangeText={(value) => handleInputChange('make', value)}
              placeholder="Vehicle make"
            />
          ) : (
            <ThemedText style={styles.displayValue}>{profile.make}</ThemedText>
          )}
        </ThemedView>


        <ThemedView style={styles.inputGroup}>
          <ThemedText style={styles.label}>Chassis Number</ThemedText>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={editedProfile.make}
              onChangeText={(value) => handleInputChange('make', value)}
              placeholder="Chassis Number"
            />
          ) : (
            <ThemedText style={styles.displayValue}>{profile.make}</ThemedText>
          )}
        </ThemedView>


        <ThemedView style={styles.inputGroup}>
          <ThemedText style={styles.label}>Model</ThemedText>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={editedProfile.model}
              onChangeText={(value) => handleInputChange('model', value)}
              placeholder="Vehicle model"
            />
          ) : (
            <ThemedText style={styles.displayValue}>{profile.model}</ThemedText>
          )}
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.buttonContainer}>
        {!isEditing ? (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(true)}>
            <ThemedText style={styles.buttonText}>Edit Profile</ThemedText>
          </TouchableOpacity>
        ) : (
          <ThemedView style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}>
              <ThemedText style={styles.buttonText}>Save</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}>
              <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        )}
      </ThemedView>
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
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    textTransform: 'uppercase',
    opacity: 0.7,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#000',
  },
  displayValue: {
    fontSize: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
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
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#000',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
  },
});