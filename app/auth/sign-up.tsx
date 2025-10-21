import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View, useColorScheme } from 'react-native';
import Animated, { FadeInDown, FadeInUp, SlideInLeft } from 'react-native-reanimated';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedView = Animated.createAnimatedComponent(ThemedView);

type Step = 'account' | 'personal' | 'vehicle';

const STEPS: Step[] = ['account', 'personal', 'vehicle'];

const StepIndicator = ({ currentStep, isDark }: { currentStep: Step; isDark: boolean }) => {
  const stepIndex = STEPS.indexOf(currentStep);
  return (
    <View style={styles.stepIndicator}>
      {STEPS.map((_, index) => (
        <View
          key={index}
          style={[
            styles.stepDot,
            index <= stepIndex 
              ? [styles.stepDotActive, isDark && styles.stepDotActiveDark]
              : [styles.stepDotInactive, isDark && styles.stepDotInactiveDark],
          ]}
        />
      ))}
    </View>
  );
};

export default function SignUpScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [currentStep, setCurrentStep] = useState<Step>('account');
  const [isLoading, setIsLoading] = useState(false);
  
  // Backend expects: username, email, password, phone, chassis, year, make, model
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    year: '',
    make: '',
    model: '',
    chassis: '',
  });

  const { signUp } = useAuth();

  const handleSignUp = async () => {
    // Validation
    if (!formData.username || !formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all required account fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (!formData.phone || formData.phone.length < 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }

    setIsLoading(true);
    try {
      // Prepare data for backend (remove confirmPassword)
      const { confirmPassword, ...signUpData } = formData;
      
      await signUp(signUpData);
      // Navigation will be handled by auth context
    } catch (error: any) {
      Alert.alert('Sign Up Failed', error.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'account':
        return formData.username && formData.email && formData.password && formData.confirmPassword;
      case 'personal':
        return formData.phone && formData.phone.length === 10;
      case 'vehicle':
        return true; // Optional fields
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!canProceed()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (currentStep === 'account' && formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

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
    <AnimatedView 
      entering={SlideInLeft.duration(400)}
      style={styles.section}
    >
      <ThemedView style={styles.inputContainer}>
        <ThemedText style={styles.label}>Username *</ThemedText>
        <TextInput
          style={[styles.input, isDark && styles.inputDark]}
          value={formData.username}
          onChangeText={(value) => handleInputChange('username', value)}
          placeholder="Choose a username"
          placeholderTextColor={isDark ? '#888' : '#999'}
          autoCapitalize="none"
        />
      </ThemedView>

      <ThemedView style={styles.inputContainer}>
        <ThemedText style={styles.label}>Email *</ThemedText>
        <TextInput
          style={[styles.input, isDark && styles.inputDark]}
          value={formData.email}
          onChangeText={(value) => handleInputChange('email', value)}
          placeholder="your.email@example.com"
          placeholderTextColor={isDark ? '#888' : '#999'}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </ThemedView>

      <ThemedView style={styles.inputContainer}>
        <ThemedText style={styles.label}>Password *</ThemedText>
        <TextInput
          style={[styles.input, isDark && styles.inputDark]}
          value={formData.password}
          onChangeText={(value) => handleInputChange('password', value)}
          placeholder="Minimum 6 characters"
          placeholderTextColor={isDark ? '#888' : '#999'}
          secureTextEntry
        />
      </ThemedView>

      <ThemedView style={styles.inputContainer}>
        <ThemedText style={styles.label}>Confirm Password *</ThemedText>
        <TextInput
          style={[styles.input, isDark && styles.inputDark]}
          value={formData.confirmPassword}
          onChangeText={(value) => handleInputChange('confirmPassword', value)}
          placeholder="Re-enter password"
          placeholderTextColor={isDark ? '#888' : '#999'}
          secureTextEntry
        />
      </ThemedView>
    </AnimatedView>
  );

  const renderPersonalStep = () => (
    <AnimatedView 
      entering={SlideInLeft.duration(400)}
      style={styles.section}
    >
      <ThemedView style={styles.inputContainer}>
        <ThemedText style={styles.label}>Phone Number *</ThemedText>
        <TextInput
          style={[styles.input, isDark && styles.inputDark]}
          value={formData.phone}
          onChangeText={(value) => handleInputChange('phone', value.replace(/[^0-9]/g, ''))}
          placeholder="1234567890"
          placeholderTextColor={isDark ? '#888' : '#999'}
          keyboardType="phone-pad"
          maxLength={10}
        />
        <ThemedText style={[styles.hint, isDark && styles.hintDark]}>
          Enter 10-digit phone number
        </ThemedText>
      </ThemedView>
    </AnimatedView>
  );

  const renderVehicleStep = () => (
    <AnimatedView 
      entering={SlideInLeft.duration(400)}
      style={styles.section}
    >
      <ThemedText style={[styles.optionalText, isDark && styles.optionalTextDark]}>
        Vehicle information is optional but helps us provide better service
      </ThemedText>

      <ThemedView style={styles.inputContainer}>
        <ThemedText style={styles.label}>Vehicle Year</ThemedText>
        <TextInput
          style={[styles.input, isDark && styles.inputDark]}
          value={formData.year}
          onChangeText={(value) => handleInputChange('year', value.replace(/[^0-9]/g, ''))}
          placeholder="e.g., 2020"
          placeholderTextColor={isDark ? '#888' : '#999'}
          keyboardType="numeric"
          maxLength={4}
        />
      </ThemedView>

      <ThemedView style={styles.inputContainer}>
        <ThemedText style={styles.label}>Vehicle Make</ThemedText>
        <TextInput
          style={[styles.input, isDark && styles.inputDark]}
          value={formData.make}
          onChangeText={(value) => handleInputChange('make', value)}
          placeholder="e.g., Toyota"
          placeholderTextColor={isDark ? '#888' : '#999'}
          maxLength={10}
        />
      </ThemedView>

      <ThemedView style={styles.inputContainer}>
        <ThemedText style={styles.label}>Vehicle Model</ThemedText>
        <TextInput
          style={[styles.input, isDark && styles.inputDark]}
          value={formData.model}
          onChangeText={(value) => handleInputChange('model', value)}
          placeholder="e.g., Camry"
          placeholderTextColor={isDark ? '#888' : '#999'}
          maxLength={10}
        />
      </ThemedView>

      <ThemedView style={styles.inputContainer}>
        <ThemedText style={styles.label}>Chassis Number</ThemedText>
        <TextInput
          style={[styles.input, isDark && styles.inputDark]}
          value={formData.chassis}
          onChangeText={(value) => handleInputChange('chassis', value)}
          placeholder="Vehicle chassis/VIN number"
          placeholderTextColor={isDark ? '#888' : '#999'}
          autoCapitalize="characters"
          maxLength={80}
        />
      </ThemedView>
    </AnimatedView>
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
        return 'Create Your Account';
      case 'personal':
        return 'Contact Information';
      case 'vehicle':
        return 'Vehicle Details';
      default:
        return '';
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <AnimatedView 
          entering={FadeInDown.duration(600)}
          style={styles.headerSection}
        >
          <IconSymbol
            size={80}
            color={isDark ? '#fff' : '#000'}
            name="person.badge.plus"
            style={styles.icon}
          />
          <ThemedText style={styles.title}>Create Account</ThemedText>
          <StepIndicator currentStep={currentStep} isDark={isDark} />
        </AnimatedView>

        <AnimatedView 
          entering={FadeInUp.delay(200).duration(600)}
          style={styles.formContainer}
        >
          <ThemedText style={styles.sectionTitle}>{getStepTitle()}</ThemedText>
          {getStepContent()}

          <View style={styles.navigationButtons}>
            {currentStep !== 'account' && (
              <AnimatedTouchable
                entering={FadeInUp.delay(400)}
                style={[styles.button, styles.backButton, isDark && styles.backButtonDark]}
                onPress={handleBack}
                disabled={isLoading}
              >
                <ThemedText style={[styles.buttonText, styles.backButtonText, isDark && styles.backButtonTextDark]}>
                  Back
                </ThemedText>
              </AnimatedTouchable>
            )}
            <AnimatedTouchable
              entering={FadeInUp.delay(500)}
              style={[
                styles.button,
                styles.nextButton,
                isDark && styles.nextButtonDark,
                currentStep === 'account' && styles.nextButtonFullWidth,
                (isLoading || !canProceed()) && styles.buttonDisabled,
              ]}
              onPress={handleNext}
              disabled={isLoading || !canProceed()}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText style={styles.buttonText}>
                  {currentStep === 'vehicle' ? 'Create Account' : 'Next'}
                </ThemedText>
              )}
            </AnimatedTouchable>
          </View>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => router.push('/auth/sign-in')}
            disabled={isLoading}
          >
            <ThemedText style={[styles.linkText, isDark && styles.linkTextDark]}>
              Already have an account? <ThemedText style={[styles.linkTextBold, isDark && styles.linkTextBoldDark]}>Sign In</ThemedText>
            </ThemedText>
          </TouchableOpacity>
        </AnimatedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    marginBottom: 24,
    fontWeight: '800',
    fontFamily: Fonts.rounded,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 6,
  },
  stepDotActive: {
    backgroundColor: '#000',
  },
  stepDotActiveDark: {
    backgroundColor: '#fff',
  },
  stepDotInactive: {
    backgroundColor: '#e0e0e0',
  },
  stepDotInactiveDark: {
    backgroundColor: '#333',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  section: {
    width: '100%',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 24,
    fontWeight: '700',
    fontFamily: Fonts.rounded,
    textAlign: 'center',
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
  hint: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
    fontFamily: Fonts.rounded,
  },
  hintDark: {
    color: '#888',
  },
  optionalText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: Fonts.rounded,
    fontStyle: 'italic',
  },
  optionalTextDark: {
    color: '#888',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
    gap: 12,
  },
  button: {
    height: 56,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  backButtonDark: {
    backgroundColor: '#262626',
    borderColor: '#333',
  },
  backButtonText: {
    color: '#000',
  },
  backButtonTextDark: {
    color: '#fff',
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#000',
  },
  nextButtonDark: {
    backgroundColor: '#fff',
  },
  nextButtonFullWidth: {
    flex: 1,
  },
  buttonDisabled: {
    opacity: 0.5,
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
  linkTextBoldDark: {
    color: '#fff',
  },
});