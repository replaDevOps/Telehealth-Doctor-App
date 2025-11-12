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
  writePrescription?: boolean;
}

const ConsultationEndedModal: React.FC<ConsultationEndedModalProps> = ({
  visible,
  onClose,
  onGetPrescription,
  writePrescription,
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

          {writePrescription ? (
            <View>
              {/* Title */}

              <Text style={styles.title}>Consultation Ended!</Text>
              {/* Description */}

              <Text style={styles.description}>
                This consultation has ended.
              </Text>
            </View>
          ) : (
            <View>
              {/* Title */}
              <Text style={styles.title}>No Prescription Added</Text>

              {/* Description */}
              <Text style={styles.description}>
                You haven’t created a prescription for this session. Are you
                sure you want to end the consultation without writing one?
              </Text>

              {/* Buttons */}
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <Text style={styles.closeButtonText}>End Consultation</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.prescriptionButton}
                  onPress={onGetPrescription}
                >
                  <Text style={styles.prescriptionButtonText}>
                    Write Prescription
                  </Text>
                </TouchableOpacity>
              </View>
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
    backgroundColor: '#15002E80',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: MODAL_WIDTH,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',

    position: 'relative',
  },
  closeIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  closeText: {
    fontSize: 28,
    color: colors.text,
    fontWeight: '400',
    marginBottom: mvs(10),
    position: 'absolute',
    top: -12,
    right: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    justifyContent: 'center',
  },
  closeButton: {
    flex: 1,
    paddingVertical: 12,
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
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  prescriptionButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
});

export default ConsultationEndedModal;
