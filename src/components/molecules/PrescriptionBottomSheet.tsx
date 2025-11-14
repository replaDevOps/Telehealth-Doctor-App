import { CustomTextInput } from '@components/common/CustomTextInput';
import React, { useState, useRef, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { colors } from '../../styles/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import usePrescriptionStore from '../../store/usePrescriptionStore';
import { MedicationCard } from './MedicationCard';
import { InfoSection } from '@components/common';
import { PATIENT_DATA } from '@constants';

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
  // Get the action from store
  const setWritePrescription = usePrescriptionStore(
    state => state.setWritePrescription,
  );
  const setPrescriptionData = usePrescriptionStore(
    state => state.setPrescriptionData,
  );

  const bottomSheetRef = useRef<BottomSheet>(null);

  // Use only one snap point to prevent expanding
  const snapPoints = useMemo(() => ['90%'], []);

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

  const handleClose = () => {
    bottomSheetRef.current?.close();
  };

  // Handle bottom sheet changes
  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose],
  );

  // Custom backdrop component
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    [],
  );

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

    // Set the state to true in Zustand store
    setWritePrescription(true);

    // Optionally save the prescription data
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
    <BottomSheet
      ref={bottomSheetRef}
      index={visible ? 0 : -1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      enablePanDownToClose={true}
      enableOverDrag={true}
      enableContentPanningGesture={false} // Disable scroll to expand
      backgroundStyle={styles.background}
      handleIndicatorStyle={styles.handleIndicator}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Ionicons name="close-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <Text style={styles.headerTitle}>Prescription</Text>

      <BottomSheetScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Your existing content remains the same */}
        {/* Patient Info */}
        <InfoSection title="Patient Information" data={PATIENT_DATA} />

        {/* Diagnosis (collapsible) */}
        <TouchableOpacity
          style={styles.collapsibleHeader}
          onPress={() => setDiagnosisExpanded(!diagnosisExpanded)}
        >
          <Text style={styles.sectionTitle}>Diagnosis</Text>
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
              label="Diagnosis Summary"
              placeholder="Write summary here..."
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
          <Text style={styles.sectionTitle}>Treatment Details</Text>
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
              label="Treatment Name"
              placeholder="e.g Root Canal Therapy"
              value={treatmentName}
              onChangeText={setTreatmentName}
            />
            <CustomTextInput
              label="Treatment Notes"
              placeholder="Write treatment notes here..."
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
            <Text style={styles.sectionTitle}>Medication</Text>
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
          <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSendPrescription}
          >
            <Text style={styles.submitButtonText}>Send Prescription</Text>
          </TouchableOpacity>
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
};

// ... styles remain the same as previous solution

/* ------------------------------------------------------------------ */
/*                             Styles                                 */
/* ------------------------------------------------------------------ */
const styles = StyleSheet.create({
  background: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handleIndicator: {
    backgroundColor: '#ccc',
    width: 40,
    height: 4,
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
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },

  /* ---- Patient Info ---- */
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

  /* ---- Collapsible Headers ---- */
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

  /* ---- Input + Text ---- */
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

  /* ---- Medication ---- */
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

  /* ---- Buttons ---- */
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
