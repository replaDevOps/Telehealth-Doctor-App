import { CustomTextInput } from '@components/common/CustomTextInput';
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  PanResponder,
} from 'react-native';
import { colors } from '../../styles/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import usePrescriptionStore from '../../store/usePrescriptionStore';
import { MedicationCard } from './MedicationCard';
import { InfoSection } from '@components/common';
import { PATIENT_DATA } from '@constants';
import { useTranslation } from 'react-i18next';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Medication {
  id: number;
  name: string;
  dosage: string;
  instructions: string;
  duration: string;
  expanded?: boolean;
}

const PrescriptionBottomSheet = ({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) => {
  const setWritePrescription = usePrescriptionStore(
    state => state.setWritePrescription,
  );
  const setPrescriptionData = usePrescriptionStore(
    state => state.setPrescriptionData,
  );
  const { t } = useTranslation();

  const [diagnosisExpanded, setDiagnosisExpanded] = useState(false);
  const [treatmentExpanded, setTreatmentExpanded] = useState(false);

  const [diagnosisSummary, setDiagnosisSummary] = useState('');
  const [treatmentName, setTreatmentName] = useState('');
  const [treatmentNotes, setTreatmentNotes] = useState('');

  const [medications, setMedications] = useState<Medication[]>([
    {
      id: 1,
      name: '',
      dosage: '',
      instructions: '',
      duration: '',
      expanded: true,
    },
  ]);

  const translateY = React.useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          handleClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  const handleClose = () => {
    Animated.timing(translateY, {
      toValue: SCREEN_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const addMedication = () => {
    setMedications([
      ...medications,
      {
        id: Date.now(),
        name: '',
        dosage: '',
        instructions: '',
        duration: '',
        expanded: true,
      },
    ]);
  };

  const removeMedication = (id: number) => {
    setMedications(medications.filter(m => m.id !== id));
  };

  const toggleMedication = (id: number) => {
    setMedications(prev =>
      prev.map(m => (m.id === id ? { ...m, expanded: !m.expanded } : m)),
    );
  };

  const updateMedicationField = (
    id: number,
    field: keyof Omit<Medication, 'id' | 'expanded'>,
    value: string,
  ) => {
    setMedications(prev =>
      prev.map(m => (m.id === id ? { ...m, [field]: value } : m)),
    );
  };

  const handleSendPrescription = () => {
    console.log('Prescription sent!');

    setWritePrescription(true);

    const prescriptionData = {
      diagnosisSummary,
      treatmentName,
      treatmentNotes,
      medications: medications.filter(m => m.name.trim() !== ''),
      timestamp: new Date().toISOString(),
    };
    setPrescriptionData(prescriptionData);

    handleClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.bottomSheetContainer,
            {
              transform: [{ translateY }],
            },
          ]}
        >
          {/* Drag Handle */}
          <View style={styles.handleContainer} {...panResponder.panHandlers}>
            <View style={styles.handle} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Ionicons name="close-outline" size={24} color="black" />
            </TouchableOpacity>
          </View>

          <Text style={styles.headerTitle}>{t('prescription')}</Text>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Patient Info */}
            <InfoSection title={t('patient_information')} data={PATIENT_DATA} />

            {/* Diagnosis (collapsible) */}
            <TouchableOpacity
              style={styles.collapsibleHeader}
              onPress={() => setDiagnosisExpanded(!diagnosisExpanded)}
            >
              <Text style={styles.sectionTitle}>{t('diagnosis')}</Text>
              <Text style={styles.expandIcon}>
                {diagnosisExpanded ? (
                  <Ionicons name="chevron-up" size={24} color="black" />
                ) : (
                  <Ionicons name="chevron-down" size={24} color="black" />
                )}
              </Text>
            </TouchableOpacity>

            {diagnosisExpanded && (
              <View style={styles.section}>
                <CustomTextInput
                  label={t('diagnosis_summary')}
                  placeholder={t('write_summary_here')}
                  value={diagnosisSummary}
                  onChangeText={setDiagnosisSummary}
                  multiline={true}
                  numberOfLines={2}
                  maxLength={150}
                  showCharCount={true}
                />
              </View>
            )}

            {/* Treatment Details (collapsible) */}
            <TouchableOpacity
              style={styles.collapsibleHeader}
              onPress={() => setTreatmentExpanded(!treatmentExpanded)}
            >
              <Text style={styles.sectionTitle}>{t('treatment_details')}</Text>
              <Text style={styles.expandIcon}>
                {treatmentExpanded ? (
                  <Ionicons name="chevron-up" size={24} color="black" />
                ) : (
                  <Ionicons name="chevron-down" size={24} color="black" />
                )}
              </Text>
            </TouchableOpacity>

            {treatmentExpanded && (
              <View style={styles.section}>
                <CustomTextInput
                  label={t('treatment_name')}
                  placeholder={t('eg_root_canal_therapy')}
                  value={treatmentName}
                  onChangeText={setTreatmentName}
                />
                <CustomTextInput
                  label={t('treatment_notes')}
                  placeholder={t('write_treatment_notes_here')}
                  value={treatmentNotes}
                  onChangeText={setTreatmentNotes}
                  multiline
                  numberOfLines={2}
                  maxLength={150}
                  showCharCount={true}
                />
              </View>
            )}

            {/* Medications */}
            <View style={styles.section}>
              <View style={styles.medicationHeader}>
                <Text style={styles.sectionTitle}>{t('medication')}</Text>
                <TouchableOpacity
                  onPress={addMedication}
                  style={styles.addBtttonContainer}
                >
                  <AntDesign name="plus" color={colors.white} size={18} />
                </TouchableOpacity>
              </View>

              {medications.map((med, idx) => (
                <MedicationCard
                  key={med.id}
                  medication={med}
                  index={idx}
                  onToggle={toggleMedication}
                  onRemove={removeMedication}
                  onUpdate={updateMedicationField}
                  medicationsLength={medications.length}
                />
              ))}
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleClose}
              >
                <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSendPrescription}
              >
                <Text style={styles.submitButtonText}>{t('send_prescription')}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bottomSheetContainer: {
    height: SCREEN_HEIGHT * 0.9,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    alignSelf: 'flex-end',
  },
  closeButton: {
    paddingHorizontal: 4,
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#333',
    alignSelf: 'center',
    marginBottom: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section1: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 16,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle1: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    color: '#222',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label1: { fontSize: 14, color: '#555' },
  value: { fontSize: 14, color: '#000', fontWeight: '500' },
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  expandIcon: { fontSize: 16, color: '#666' },
  section: { marginTop: 10 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  charCount: {
    fontSize: 11,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
    marginRight: 5,
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addBtttonContainer: {
    backgroundColor: colors.primary,
    padding: 3,
    borderRadius: 5,
  },
  addButton: { fontSize: 28, color: 'white', fontWeight: '300' },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    paddingBottom: 120,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#7C3AED',
    alignItems: 'center',
  },
  cancelButtonText: { color: '#7C3AED', fontSize: 15, fontWeight: '600' },
  submitButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
  },
  submitButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});

export default PrescriptionBottomSheet;
