import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { colors } from '../../styles/colors'; // Adjust path as needed
import { mvs } from '@config/metrices';

const { width } = Dimensions.get('window');
const MODAL_WIDTH = width * 0.85;

interface ConsultationEndedModalProps {
  visible: boolean;
  onClose: () => void;
  onGetPrescription: () => void;
  isDoctor?: boolean;
  onAddPrescription?: () => void;
  onEndConsultation?: () => void;
}

const ConsultationEndedModal: React.FC<ConsultationEndedModalProps> = ({
  visible,
  onClose,
  onGetPrescription,
  isDoctor = false,
  onAddPrescription,
  onEndConsultation,
}) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Close Icon */}
          <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>

          {/* Title */}
          <Text style={styles.title}>
            {'Consultation Ended'}
          </Text>

          {/* Description */}
          <Text style={styles.description}>
            {isDoctor
              ? 'The consultation has ended. Your prescription will be sent to the patient.'
              : 'The consultation has ended. The doctor has shared your prescription. You can download it now or anytime from your history.'}
          </Text>

          {/* Buttons */}
          {isDoctor ? (
            onAddPrescription ? (
              // Show prescription button (with optional end button if onEndConsultation is provided)
              <View style={styles.buttonColumn}>
                <TouchableOpacity
                  style={styles.prescriptionButton}
                  onPress={onAddPrescription}
                >
                  <Text style={styles.prescriptionButtonText}>
                    Add Prescription
                  </Text>
                </TouchableOpacity>
                {onEndConsultation && (
                  // Only show End Consultation button if handler is provided (doctor manually ending)
                  <TouchableOpacity
                    style={styles.endButton}
                    onPress={onEndConsultation}
                  >
                    <Text style={styles.endButtonText}>End Consultation</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <Text style={styles.closeButtonText}>
                    {onEndConsultation ? 'Cancel' : 'Close'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              // Show only Close button when consultation has already ended and no prescription option
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            )
          ) : (
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(21, 0, 46, 0.5)', // Muted purple overlay
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: MODAL_WIDTH,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'flex-start',
    position: 'relative',
  },
  closeIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  closeText: {
    fontSize: 24,
    color: colors.text,
    fontWeight: '400',
    lineHeight: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    marginTop: 8,
    textAlign: 'center',
    width: '100%',
  },
  description: {
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: 'left',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 0,
    width: '100%',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    justifyContent: 'center',
  },
  buttonColumn: {
    flexDirection: 'column',
    gap: 12,
    width: '100%',
  },
  closeButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.gray,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  closeButtonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  prescriptionButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  prescriptionButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  endButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.red,
    alignItems: 'center',
  },
  endButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
});

export default ConsultationEndedModal;
