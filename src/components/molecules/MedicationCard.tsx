import { CustomTextInput } from '@components/common/CustomTextInput';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../styles/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface Medication {
  id: number;
  name: string;
  dosage: string;
  instructions: string;
  duration: string;
  expanded?: boolean;
}

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

export const MedicationCard: React.FC<MedicationCardProps> = ({
  medication,
  index,
  onToggle,
  onRemove,
  onUpdate,
  medicationsLength,
}) => {
  return (
    <View style={styles.medicationCard}>
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

      {medication.expanded && (
        <>
          <CustomTextInput
            label="Medicine Name"
            placeholder="e.g Amoxicilin 500mg"
            value={medication.name}
            onChangeText={text => onUpdate(medication.id, 'name', text)}
            style={{ backgroundColor: colors.white }}
          />

          <CustomTextInput
            label="Dosage"
            placeholder="e.g 1 capsule twice daily"
            value={medication.dosage}
            onChangeText={text => onUpdate(medication.id, 'dosage', text)}
            style={{ backgroundColor: colors.white }}
          />

          <CustomTextInput
            label="Duration"
            placeholder="e.g 5 days"
            value={medication.duration}
            onChangeText={text => onUpdate(medication.id, 'duration', text)}
            style={{ backgroundColor: colors.white }}
          />

          <CustomTextInput
            label="Instructions"
            placeholder="Any additional instructions..."
            value={medication.instructions}
            onChangeText={text => onUpdate(medication.id, 'instructions', text)}
            multiline
            numberOfLines={2}
            maxLength={150}
            showCharCount={true}
            style={{ backgroundColor: colors.white, borderRadius: 8 }}
          />
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
    paddingBottom: 30,
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
    backgroundColor: colors.gray,
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
