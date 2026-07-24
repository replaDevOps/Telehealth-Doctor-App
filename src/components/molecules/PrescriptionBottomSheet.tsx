import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { colors } from '../../styles/colors';
import { mvs } from '@config/metrices';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Medication {
  medicineName: string;
  dosage: string;
  duration: string;
  instructions: string;
}

interface PrescriptionFormData {
  diagnosisSummary: string;
  treatmentName: string;
  treatmentNotes: string;
  medications: Medication[];
  confirmed: boolean;
}

interface PrescriptionBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSave: (prescriptions: Array<{ name: string; description: string }>) => Promise<void>;
  consultationID: string | number;
  consultationData?: any;
}

const PrescriptionBottomSheet: React.FC<PrescriptionBottomSheetProps> = ({
  visible,
  onClose,
  onSave,
  consultationID,
  consultationData,
}) => {
  const [formData, setFormData] = useState<PrescriptionFormData>({
    diagnosisSummary: '',
    treatmentName: '',
    treatmentNotes: '',
    medications: [{ medicineName: '', dosage: '', duration: '', instructions: '' }],
    confirmed: false,
  });
  const [expandedMedications, setExpandedMedications] = useState<{ [key: number]: boolean }>({
    0: true,
  });
  const [isSaving, setIsSaving] = useState(false);

  // Get current date
  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  // Get patient data from consultation
  const patientData = consultationData?.patient || {};
  const patientName = patientData?.name || 'Patient';
  const patientAge = patientData?.age || '';
  const patientGender = patientData?.gender || '';

  useEffect(() => {
    if (visible) {
      // Reset form when opened
      setFormData({
        diagnosisSummary: '',
        treatmentName: '',
        treatmentNotes: '',
        medications: [{ medicineName: '', dosage: '', duration: '', instructions: '' }],
        confirmed: false,
      });
      setExpandedMedications({ 0: true });
    }
  }, [visible]);

  const handleAddMedication = () => {
    setFormData(prev => ({
      ...prev,
      medications: [...prev.medications, { medicineName: '', dosage: '', duration: '', instructions: '' }],
    }));
    const newIndex = formData.medications.length;
    setExpandedMedications(prev => ({ ...prev, [newIndex]: true }));
  };

  const handleRemoveMedication = (index: number) => {
    if (formData.medications.length > 1) {
      setFormData(prev => ({
        ...prev,
        medications: prev.medications.filter((_, i) => i !== index),
      }));
      const newExpanded = { ...expandedMedications };
      delete newExpanded[index];
      // Reindex
      const reindexed: { [key: number]: boolean } = {};
      Object.keys(newExpanded).forEach((key, i) => {
        reindexed[i] = newExpanded[Number(key)];
      });
      setExpandedMedications(reindexed);
    }
  };

  const handleToggleMedication = (index: number) => {
    setExpandedMedications(prev => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleUpdateMedication = (
    index: number,
    field: keyof Medication,
    value: string,
  ) => {
    const updated = [...formData.medications];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({ ...prev, medications: updated }));
  };

  const handleUpdateField = (field: keyof PrescriptionFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getCharacterCount = (text: string, maxLength: number = 150) => {
    return `${text.length}/${maxLength}`;
  };

  const handleSave = async () => {
    // Validate form
    if (!formData.diagnosisSummary.trim()) {
      Alert.alert('Error', 'Please enter a diagnosis summary.');
      return;
    }

    if (!formData.treatmentName.trim()) {
      Alert.alert('Error', 'Please enter a treatment name.');
      return;
    }

    const validMedications = formData.medications.filter(
      m => m.medicineName.trim() && m.dosage.trim() && m.duration.trim(),
    );

    if (validMedications.length === 0) {
      Alert.alert('Error', 'Please add at least one medication with name, dosage, and duration.');
      return;
    }

    if (!formData.confirmed) {
      Alert.alert('Error', 'Please confirm that the prescription is accurate.');
      return;
    }

    setIsSaving(true);
    try {
      // Transform form data to API format
      const prescriptions = [
        {
          name: 'Diagnosis',
          description: formData.diagnosisSummary,
        },
        {
          name: formData.treatmentName,
          description: formData.treatmentNotes || 'No additional notes',
        },
        ...validMedications.map(med => ({
          name: med.medicineName,
          description: `Dosage: ${med.dosage}, Duration: ${med.duration}${med.instructions ? `, Instructions: ${med.instructions}` : ''}`,
        })),
      ];

      await onSave(prescriptions);
      onClose();
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to save prescription');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Prescription</Text>
            <TouchableOpacity
              onPress={handleClose}
              disabled={isSaving}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}
          >
            {/* Patient Information Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Patient Information</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Patient Name:</Text>
                <Text style={styles.infoValue}>{patientName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Age:</Text>
                <Text style={styles.infoValue}>{patientAge || 'N/A'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Gender:</Text>
                <Text style={styles.infoValue}>{patientGender || 'N/A'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Date:</Text>
                <Text style={styles.infoValue}>{currentDate}</Text>
              </View>
            </View>

            {/* Diagnosis Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Diagnosis</Text>
              <TextInput
                style={[styles.textArea, styles.diagnosisTextArea]}
                placeholder="Write summary here...."
                value={formData.diagnosisSummary}
                onChangeText={value => {
                  if (value.length <= 150) {
                    handleUpdateField('diagnosisSummary', value);
                  }
                }}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                placeholderTextColor={colors.secondaryText}
                maxLength={150}
              />
              <Text style={styles.charCount}>
                {getCharacterCount(formData.diagnosisSummary)}
              </Text>
            </View>

            {/* Treatment Details Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Treatment Details</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Treatment Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g Root Canal Therapy"
                  value={formData.treatmentName}
                  onChangeText={value => handleUpdateField('treatmentName', value)}
                  placeholderTextColor={colors.secondaryText}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Treatment Notes</Text>
                <TextInput
                  style={[styles.textArea, styles.treatmentTextArea]}
                  placeholder="Write treatment notes here.."
                  value={formData.treatmentNotes}
                  onChangeText={value => {
                    if (value.length <= 150) {
                      handleUpdateField('treatmentNotes', value);
                    }
                  }}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  placeholderTextColor={colors.secondaryText}
                  maxLength={150}
                />
                <Text style={styles.charCount}>
                  {getCharacterCount(formData.treatmentNotes)}
                </Text>
              </View>
            </View>

            {/* Medication Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Medication</Text>
                <TouchableOpacity
                  style={styles.addMedicationButton}
                  onPress={handleAddMedication}
                >
                  <Ionicons name="add-circle" size={24} color={colors.primary} />
                </TouchableOpacity>
              </View>

              {formData.medications.map((medication, index) => (
                <View key={index} style={styles.medicationCard}>
                  <TouchableOpacity
                    style={styles.medicationHeader}
                    onPress={() => handleToggleMedication(index)}
                  >
                    <Text style={styles.medicationTitle}>
                      Medicine {index + 1}
                    </Text>
                    <View style={styles.medicationHeaderActions}>
                      <Ionicons
                        name={expandedMedications[index] ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color={colors.text}
                      />
                      {formData.medications.length > 1 && (
                        <TouchableOpacity
                          onPress={() => handleRemoveMedication(index)}
                          style={styles.removeMedicationButton}
                        >
                          <Ionicons name="close-circle" size={20} color={colors.red} />
                        </TouchableOpacity>
                      )}
                    </View>
                  </TouchableOpacity>

                  {expandedMedications[index] && (
                    <View style={styles.medicationContent}>
                      <View style={styles.inputGroup}>
                        <Text style={styles.label}>Medicine Name</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="e.g Amoxicillin 500mg"
                          value={medication.medicineName}
                          onChangeText={value =>
                            handleUpdateMedication(index, 'medicineName', value)
                          }
                          placeholderTextColor={colors.secondaryText}
                        />
                      </View>

                      <View style={styles.inputGroup}>
                        <Text style={styles.label}>Dosage</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="e.g 1 capsule twice daily"
                          value={medication.dosage}
                          onChangeText={value =>
                            handleUpdateMedication(index, 'dosage', value)
                          }
                          placeholderTextColor={colors.secondaryText}
                        />
                      </View>

                      <View style={styles.inputGroup}>
                        <Text style={styles.label}>Duration</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="e.g 5 days"
                          value={medication.duration}
                          onChangeText={value =>
                            handleUpdateMedication(index, 'duration', value)
                          }
                          placeholderTextColor={colors.secondaryText}
                        />
                      </View>

                      <View style={styles.inputGroup}>
                        <Text style={styles.label}>Instructions</Text>
                        <TextInput
                          style={[styles.textArea, styles.instructionsTextArea]}
                          placeholder="Any additional instructions...."
                          value={medication.instructions}
                          onChangeText={value => {
                            if (value.length <= 150) {
                              handleUpdateMedication(index, 'instructions', value);
                            }
                          }}
                          multiline
                          numberOfLines={3}
                          textAlignVertical="top"
                          placeholderTextColor={colors.secondaryText}
                          maxLength={150}
                        />
                        <Text style={styles.charCount}>
                          {getCharacterCount(medication.instructions)}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              ))}
            </View>

            {/* Confirmation Checkbox */}
            <View style={styles.confirmationSection}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => handleUpdateField('confirmed', !formData.confirmed)}
              >
                <View style={[styles.checkbox, formData.confirmed && styles.checkboxChecked]}>
                  {formData.confirmed && (
                    <Ionicons name="checkmark" size={16} color={colors.white} />
                  )}
                </View>
              </TouchableOpacity>
              <Text style={styles.confirmationText}>
                I confirm this prescription is accurate. My digital signature is applied.
              </Text>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.cancelButton, isSaving && styles.disabledButton]}
              onPress={handleClose}
              disabled={isSaving}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sendButton, isSaving && styles.disabledButton]}
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.sendButtonText}>Send Prescription</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: SCREEN_HEIGHT * 0.95,
    height: SCREEN_HEIGHT * 0.85, // Set explicit height
    flexDirection: 'column', // Ensure flex layout
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: mvs(20),
    paddingTop: mvs(20),
    paddingBottom: mvs(16),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    minHeight: 300, // Ensure content area has minimum height
  },
  contentContainer: {
    padding: mvs(20),
    flexGrow: 1, // Allow content to grow
  },
  section: {
    marginBottom: mvs(24),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: mvs(12),
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: mvs(12),
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: mvs(8),
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    width: 120,
  },
  infoValue: {
    fontSize: 14,
    color: colors.secondaryText,
    flex: 1,
  },
  inputGroup: {
    marginBottom: mvs(12),
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: mvs(8),
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: mvs(12),
    fontSize: 14,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: mvs(12),
    fontSize: 14,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  diagnosisTextArea: {
    minHeight: 100,
    paddingTop: mvs(12),
  },
  treatmentTextArea: {
    minHeight: 100,
    paddingTop: mvs(12),
  },
  instructionsTextArea: {
    minHeight: 80,
    paddingTop: mvs(12),
  },
  charCount: {
    fontSize: 12,
    color: colors.secondaryText,
    textAlign: 'right',
    marginTop: mvs(4),
  },
  addMedicationButton: {
    padding: 4,
  },
  medicationCard: {
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    padding: mvs(12),
    marginBottom: mvs(12),
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  medicationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  medicationHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: mvs(8),
  },
  removeMedicationButton: {
    padding: 4,
  },
  medicationContent: {
    marginTop: mvs(12),
  },
  confirmationSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: mvs(20),
    padding: mvs(12),
    backgroundColor: colors.lightGray,
    borderRadius: 8,
  },
  checkboxContainer: {
    marginRight: mvs(8),
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
  },
  confirmationText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    gap: mvs(12),
    paddingHorizontal: mvs(20),
    paddingVertical: mvs(16),
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: mvs(14),
    borderRadius: 12,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  sendButton: {
    flex: 1,
    paddingVertical: mvs(14),
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default PrescriptionBottomSheet;
