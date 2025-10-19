import { Image } from 'expo-image';
import { Platform, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal, View, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as Audio from 'expo-av';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

interface CaptureResult {
  id: string;
  type: 'image' | 'audio';
  timestamp: string;
  content: string;
  duration?: string;
  uri?: string;
}

export default function HomeScreen() {
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [problemDescription, setProblemDescription] = useState('');
  const [result, setResult] = useState<{ problem: string; solution: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recentCaptures, setRecentCaptures] = useState<CaptureResult[]>([
    {
      id: '1',
      type: 'image',
      timestamp: 'Today 2:30 PM',
      content: 'Leaking pipe under kitchen sink',
    },
    {
      id: '2',
      type: 'audio',
      timestamp: 'Today 1:15 PM',
      content: 'The AC unit is making a strange noise and not cooling properly...',
      duration: '2:45',
    },
    {
      id: '3',
      type: 'image',
      timestamp: 'Yesterday 4:20 PM',
      content: 'Cracked bathroom tile',
    },
  ]);
  const [recordingRef] = useState<{ current: Audio.Recording | null }>({ current: null });

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedMedia(result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
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
  };

  const handleStartRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      setIsRecording(true);
      setRecordingTime(0);

      const interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      return () => clearInterval(interval);
    } catch (err) {
      alert('Failed to start recording');
    }
  };

  const handleStopRecording = async () => {
    if (!recordingRef.current) return;

    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();

      const newCapture: CaptureResult = {
        id: `audio-${Date.now()}`,
        type: 'audio',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: 'Audio captured and transcribed: The washing machine is leaking from the bottom...',
        duration: `${Math.floor(recordingTime / 60)}:${(recordingTime % 60).toString().padStart(2, '0')}`,
        uri,
      };

      setRecentCaptures([newCapture, ...recentCaptures]);
      setProblemDescription(newCapture.content.replace('Audio captured and transcribed: ', ''));
      setIsRecording(false);
      setShowAudioModal(false);
      recordingRef.current = null;
    } catch (err) {
      alert('Failed to stop recording');
    }
  };

  const handleTranscribeAudio = async () => {
    try {
      await Audio.requestPermissionsAsync();
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Audio,
      });

      if (!result.canceled) {
        setIsLoading(true);
        // Mock transcription - in a real app, send to backend
        const mockTranscription = 'The kitchen faucet has been dripping continuously for the past few days and the water pressure seems low on that line. Please help identify the issue.';
        setProblemDescription(mockTranscription);
        setIsLoading(false);
      }
    } catch (err) {
      alert('Failed to transcribe audio');
    }
  };

  const handleSubmitProblem = async () => {
    if (!problemDescription && !selectedMedia) {
      alert('Please describe your problem or upload media');
      return;
    }

    setIsLoading(true);
    try {
      // Mock API call - simulate backend response
      setTimeout(() => {
        const mockResult = {
          problem: problemDescription || 'Issue from uploaded media',
          solution: 'We recommend the following steps:\n\n1. Turn off the main water supply valve\n2. Inspect the pipe connection for cracks or corrosion\n3. If minor, apply plumber\'s tape and tighten connections\n4. For significant damage, replace the pipe section with PVC or copper tubing matching the original diameter\n5. If unsure, contact a licensed plumber for professional assessment\n\nEstimated cost: $50-200 for DIY, $200-500 with professional service.',
        };
        setResult(mockResult);
        setProblemDescription('');
        setSelectedMedia(null);
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      alert('Error processing problem. Please try again.');
      setIsLoading(false);
    }
  };

  const CaptureModal = ({ visible, title, onClose, onCapture, isRecording, recordingTime }: any) => (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <ThemedView style={styles.modalContent}>
          <ThemedText style={styles.modalTitle}>{title}</ThemedText>

          {isRecording ? (
            <ThemedView style={styles.recordingContainer}>
              <ThemedView style={styles.recordingIndicator}>
                <View style={styles.recordingDot} />
                <ThemedText style={styles.recordingTime}>
                  {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                </ThemedText>
              </ThemedView>
              <ThemedText style={styles.recordingText}>Recording in progress...</ThemedText>
            </ThemedView>
          ) : null}

          <TouchableOpacity
            onPress={isRecording ? handleStopRecording : onCapture}
            style={[styles.captureButton, isRecording && styles.stopButton]}
          >
            <ThemedText style={styles.captureButtonText}>
              {isRecording ? '⏹ Stop Recording' : `${title.includes('Photo') ? '■ Take Photo' : '● Start Recording'}`}
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
      <ThemedView style={[styles.captureIcon, { backgroundColor: item.type === 'image' ? '#E8F5FF' : '#FFF3E0' }]}>
        <ThemedText style={styles.captureEmoji}>
          {item.type === 'image' ? '■' : '●'}
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.captureInfo}>
        <ThemedText style={styles.captureTitle}>
          {item.type === 'image' ? 'Photo Capture' : 'Audio Transcription'}
        </ThemedText>
        <ThemedText style={styles.captureDescription} numberOfLines={1}>
          {item.content}
        </ThemedText>
        <ThemedText style={styles.captureTime}>
          {item.timestamp} {item.duration && `• ${item.duration}`}
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
              <ThemedText style={styles.subtitle}>Describe your issue or capture media</ThemedText>
            </ThemedView>

            <ThemedView style={styles.quickActionsContainer}>
              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => setShowCameraModal(true)}
              >
                <ThemedText style={styles.quickActionEmoji}>■</ThemedText>
                <ThemedText style={styles.quickActionText}>Take Photo</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => setShowAudioModal(true)}
              >
                <ThemedText style={styles.quickActionEmoji}>●</ThemedText>
                <ThemedText style={styles.quickActionText}>Record Audio</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={handlePickImage}
              >
                <ThemedText style={styles.quickActionEmoji}>↓</ThemedText>
                <ThemedText style={styles.quickActionText}>Upload</ThemedText>
              </TouchableOpacity>
            </ThemedView>

            <ThemedView style={styles.inputContainer}>
              <ThemedView style={styles.textInputWrapper}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Describe the issue here..."
                  placeholderTextColor="#999"
                  value={problemDescription}
                  onChangeText={setProblemDescription}
                  multiline
                  numberOfLines={4}
                />
                <TouchableOpacity
                  style={styles.transcribeButton}
                  onPress={handleTranscribeAudio}
                  disabled={isLoading}
                >
                  <ThemedText style={styles.transcribeButtonText}>∿</ThemedText>
                </TouchableOpacity>
              </ThemedView>

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
        isRecording={false}
      />

      <CaptureModal
        visible={showAudioModal}
        title="Record Audio"
        onClose={() => setShowAudioModal(false)}
        onCapture={handleStartRecording}
        isRecording={isRecording}
        recordingTime={recordingTime}
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
    maxWidth: 100,
  },
  quickActionEmoji: {
    fontSize: 24,
    fontWeight: '600',
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
  textInputWrapper: {
    position: 'relative',
    flexDirection: 'row',
    width: '100%',
  },
  textInput: {
    flex: 1,
    padding: 16,
    paddingRight: 48,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    fontSize: 16,
    color: '#000',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  transcribeButton: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  transcribeButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
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
  recentCapturesContainer: {
    marginBottom: 20,
    gap: 8,
  },
  recentCapturesTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    color: '#333',
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
    fontWeight: '600',
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
    flex: 1,
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
  recordingContainer: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 20,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ff3b30',
  },
  recordingTime: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  recordingText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  captureButton: {
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  stopButton: {
    backgroundColor: '#ff3b30',
  },
  captureButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
});