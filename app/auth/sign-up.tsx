import { useState } from 'react';
import { StyleSheet, TouchableOpacity, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/auth-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';

type Step = 'account' | 'personal' | 'vehicle';

const STEPS: Step[] = ['account', 'personal', 'vehicle'];

const StepIndicator = ({ currentStep }: { currentStep: Step }) => {
  const stepIndex = STEPS.indexOf(currentStep);
  return (
    <View style={styles.stepIndicator}>
      {STEPS.map((_, index) => (
        <View
          key={index}
          style={[
            styles.stepDot,
            index <= stepIndex ? styles.stepDotActive : styles.stepDotInactive,
          ]}
        />
      ))}
    </View>
  );
};

export default function SignUpScreen() {
  const [currentStep, setCurrentStep] = useState<Step>('account');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    year: '',
    make: '',
    model: '',
    chassisNumber: '',
  });

  const { signUp } = useAuth();

  const handleSignUp = () => {
    signUp(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleNext = () => {
    const currentIndex = STEPS.indexOf(currentStep);
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1]);
    } else {
      handleSignUp();
    }
  };

  const handleBack = () => {
    const currentIndex = STEPS.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1]);
    }
  };

  const renderAccountStep = () => (
    <ThemedView style={styles.section}>
      <TextInput
        style={styles.input}
        value={formData.email}
        onChangeText={(value) => handleInputChange('email', value)}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        value={formData.password}
        onChangeText={(value) => handleInputChange('password', value)}
        placeholder="Password"
        secureTextEntry
      />
    </ThemedView>
  );

  const renderPersonalStep = () => (
    <ThemedView style={styles.section}>
      <TextInput
        style={styles.input}
        value={formData.firstName}
        onChangeText={(value) => handleInputChange('firstName', value)}
        placeholder="First Name"
      />
      <TextInput
        style={styles.input}
        value={formData.lastName}
        onChangeText={(value) => handleInputChange('lastName', value)}
        placeholder="Last Name"
      />
      <TextInput
        style={styles.input}
        value={formData.phone}
        onChangeText={(value) => handleInputChange('phone', value)}
        placeholder="Phone Number"
        keyboardType="phone-pad"
      />
    </ThemedView>
  );

  const renderVehicleStep = () => (
    <ThemedView style={styles.section}>
      <TextInput
        style={styles.input}
        value={formData.year}
        onChangeText={(value) => handleInputChange('year', value)}
        placeholder="Vehicle Year"
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        value={formData.make}
        onChangeText={(value) => handleInputChange('make', value)}
        placeholder="Vehicle Make"
      />
      <TextInput
        style={styles.input}
        value={formData.model}
        onChangeText={(value) => handleInputChange('model', value)}
        placeholder="Vehicle Model"
      />
      <TextInput
        style={styles.input}
        value={formData.chassisNumber}
        onChangeText={(value) => handleInputChange('chassisNumber', value)}
        placeholder="Chassis Number"
      />
    </ThemedView>
  );

  const getStepContent = () => {
    switch (currentStep) {
      case 'account':
        return renderAccountStep();
      case 'personal':
        return renderPersonalStep();
      case 'vehicle':
        return renderVehicleStep();
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'account':
        return 'Account Setup';
      case 'personal':
        return 'Personal Information';
      case 'vehicle':
        return 'Vehicle Information';
      default:
        return '';
    }
  };

  return (
    <ThemedView style={styles.container}>
      <IconSymbol
        size={80}
        color="#808080"
        name="person.badge.plus"
        style={styles.icon}
      />

      <ThemedText style={styles.title}>Create Account</ThemedText>
      <StepIndicator currentStep={currentStep} />
      
      <ThemedText style={styles.sectionTitle}>{getStepTitle()}</ThemedText>
      {getStepContent()}

      <View style={styles.navigationButtons}>
        {currentStep !== 'account' && (
          <TouchableOpacity
            style={[styles.button, styles.backButton]}
            onPress={handleBack}>
            <ThemedText style={styles.buttonText}>Back</ThemedText>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[
            styles.button,
            styles.nextButton,
            currentStep === 'account' && styles.nextButtonFullWidth,
          ]}
          onPress={handleNext}>
          <ThemedText style={styles.buttonText}>
            {currentStep === 'vehicle' ? 'Sign Up' : 'Next'}
          </ThemedText>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => router.push('/auth/sign-in')}>
        <ThemedText>Already have an account? Sign In</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  icon: {
    marginTop: 40,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
    fontFamily: Fonts.rounded,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  stepDotActive: {
    backgroundColor: '#007AFF',
  },
  stepDotInactive: {
    backgroundColor: '#ddd',
  },
  section: {
    width: '100%',
    maxWidth: 400,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 15,
    fontWeight: '600',
    fontFamily: Fonts.rounded,
    textAlign: 'center',
  },
  input: {
    height: 50,
    padding: 10,
    fontSize: 16,
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 400,
    marginBottom: 15,
  },
  button: {
    height: 50,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
  },
  backButton: {
    flex: 1,
    marginRight: 10,
    backgroundColor: '#6c757d',
  },
  nextButton: {
    flex: 1,
    marginLeft: 10,
  },
  nextButtonFullWidth: {
    marginLeft: 0,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    padding: 10,
    alignItems: 'center',
  },
});