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
  hasPrescription?: boolean;
}

const ConsultationEndedModal: React.FC<ConsultationEndedModalProps> = ({
  visible,
  onClose,
  onGetPrescription,
  isDoctor = false,
  onAddPrescription,
  onEndConsultation,
  hasPrescription = false,
}) => {
  const shouldPromptForPrescription = isDoctor && !hasPrescription && onAddPrescription;

  const titleText = shouldPromptForPrescription
    ? 'No Prescription Added'
    : hasPrescription
    ? 'Consultation Complete!'
    : 'Consultation Ended!';

  const descriptionText = shouldPromptForPrescription
    ? "You haven't created a prescription for this session. Are you sure you want to end the consultation without writing one?"
    : isDoctor && hasPrescription
    ? 'The consultation has ended successfully. The prescription has been shared with the patient.'
    : isDoctor
    ? 'The consultation has ended.'
    : 'The consultation has ended. The doctor has shared your prescription. You can download it now or anytime from your history.';

  const handleEndPress = () => {
    if (onEndConsultation) {
      onEndConsultation();
    } else {
      onClose();
    }
  };

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
          <Text style={styles.title}>{titleText}</Text>

          {/* Description */}
          <Text style={styles.description}>{descriptionText}</Text>

          {/* Buttons */}
          {shouldPromptForPrescription ? (
            <View style={styles.primaryActionRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.secondaryActionButton]}
                onPress={handleEndPress}
              >
                <Text style={[styles.actionButtonText, styles.secondaryActionText]}>
                  End Consultation
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.primaryActionButton]}
                onPress={onAddPrescription || onClose}
                disabled={!onAddPrescription}
              >
                <Text style={styles.primaryActionText}>Write Prescription</Text>
              </TouchableOpacity>
            </View>
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
  primaryActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  secondaryActionButton: {
    backgroundColor: 'rgba(118, 37, 215, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(118, 37, 215, 0.2)',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryActionText: {
    color: colors.secondaryText,
  },
  primaryActionButton: {
    backgroundColor: colors.primary,
    borderWidth: 0,
  },
  primaryActionText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
});

export default ConsultationEndedModal;
