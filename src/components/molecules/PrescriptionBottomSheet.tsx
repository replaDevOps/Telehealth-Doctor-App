import { CustomTextInput } from '@components/common/CustomTextInput';
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
} from 'react-native';
import { colors } from '../../styles/colors'; // Adjust path as needed

import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';

interface Medication {
  id: number;
  name: string;
  dosage: string;
  instructions: string;
  duration: string;
  expanded?: boolean;
}

/* ------------------------------------------------------------------ */
/*                     PrescriptionBottomSheet                       */
/* ------------------------------------------------------------------ */
const PrescriptionBottomSheet = ({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) => {
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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.bottomSheet}>
          {/* ---------- Header ---------- */}

          <View style={styles.header}>
            <View />

            {/* <Text style={styles.headerTitle}>Prescription</Text>
             */}
            <View
              style={{
                alignItems: 'center',
                width: 50,
                height: 5,
                backgroundColor: 'black',
                borderRadius: 10,
              }}
            />
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-outline" size={24} color="black" />
            </TouchableOpacity>
          </View>

          <Text style={styles.headerTitle}>Prescription</Text>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* ---------- Patient Info ---------- */}
            <Text style={styles.sectionTitle1}>Patient Information</Text>
            <View style={styles.section1}>
              <View style={styles.rowBetween}>
                <Text style={styles.label1}>Patient Name:</Text>
                <Text style={styles.value}>Ali Abdul Aziz</Text>
              </View>
              <View style={styles.rowBetween}>
                <Text style={styles.label1}>Age:</Text>
                <Text style={styles.value}>20</Text>
              </View>
              <View style={styles.rowBetween}>
                <Text style={styles.label1}>Gender:</Text>
                <Text style={styles.value}>Male</Text>
              </View>
              <View style={styles.rowBetween}>
                <Text style={styles.label1}>Date:</Text>
                <Text style={styles.value}>02/02/2025</Text>
              </View>
            </View>

            {/* ---------- Diagnosis (collapsible) ---------- */}
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
                  numberOfLines={3}
                  maxLength={100}
                />
                <Text style={styles.charCount}>
                  {diagnosisSummary.length}/100
                </Text>
              </View>
            )}

            {/* ---------- Treatment Details (collapsible) ---------- */}
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
                  numberOfLines={3}
                  maxLength={100}
                />
                <Text style={styles.charCount}>
                  {treatmentNotes.length}/100
                </Text>
              </View>
            )}

            {/* ---------- Medications ---------- */}
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

            {/* ---------- Buttons ---------- */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton}>
                <Text style={styles.submitButtonText}>Send Prescription</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

/* ------------------------------------------------------------------ */
/*                     Medication Card Component                     */
/* ------------------------------------------------------------------ */
interface MedicationCardProps {
  medication: Medication;
  index: number;
  onToggle: (id: number) => void;
  onRemove: (id: number) => void;
  onUpdate: (
    id: number,
    field: keyof Omit<Medication, 'id' | 'expanded'>,
    value: string,
  ) => void;
  medicationsLength: number;
}

const MedicationCard: React.FC<MedicationCardProps> = ({
  medication,
  index,
  onToggle,
  onRemove,
  onUpdate,
  medicationsLength,
}) => {
  return (
    <View style={styles.medicationCard}>
      {/* Header */}
      <TouchableOpacity
        style={styles.medicationCardHeader}
        onPress={() => onToggle(medication.id)}
      >
        <Text style={styles.medicationTitle}>Medicine {index + 1}</Text>
        <View style={styles.rightIcons}>
          <Text style={styles.toggleIcon}>
            {medication.expanded ? (
              <Ionicons name="chevron-up" size={24} color="black" />
            ) : (
              <Ionicons name="chevron-down" size={24} color="black" />
            )}
          </Text>
          {medicationsLength > 1 && (
            <TouchableOpacity
              style={{
                padding: 2,
                backgroundColor: 'red',
                borderRadius: '50%',
              }}
              onPress={e => {
                e.stopPropagation();
                onRemove(medication.id);
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close-outline" size={18} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>

      {/* Body */}
      {medication.expanded && (
        <>
          <CustomTextInput
            label="Medicine Name"
            placeholder="e.g Amoxicilin 500mg"
            value={medication.name}
            onChangeText={text => onUpdate(medication.id, 'name', text)}
          />

          <CustomTextInput
            label="Dosage"
            placeholder="e.g 1 capsule twice daily"
            value={medication.dosage}
            onChangeText={text => onUpdate(medication.id, 'dosage', text)}
          />

          <CustomTextInput
            label="Duration"
            placeholder="e.g 5 days"
            value={medication.duration}
            onChangeText={text => onUpdate(medication.id, 'duration', text)}
          />

          <CustomTextInput
            label="Instructions"
            placeholder="Any additional instructions..."
            value={medication.instructions}
            onChangeText={text => onUpdate(medication.id, 'instructions', text)}
            multiline
            numberOfLines={2}
            maxLength={10}
          />
          <Text style={styles.charCount}>
            {medication.instructions.length}/10
          </Text>
        </>
      )}
    </View>
  );
};

/* ------------------------------------------------------------------ */
/*                             Styles                                 */
/* ------------------------------------------------------------------ */
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  closeButton: { fontSize: 24, color: '#333', width: 30 },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    alignSelf: 'center',
  },

  content: { flex: 1, paddingHorizontal: 16 },

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
  charCount: { fontSize: 11, color: '#999', textAlign: 'right', marginTop: 4 },

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
  medicationCard: {
    backgroundColor: '#fafafa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  medicationCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  medicationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  rightIcons: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  toggleIcon: { fontSize: 16, color: '#666' },
  removeButton: { fontSize: 24, color: '#EF4444' },

  /* ---- Buttons ---- */
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
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
