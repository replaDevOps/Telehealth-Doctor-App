import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  ActivityIndicator,
  Alert,
  Modal,
  ImageSourcePropType,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { patient } from '@assets/images';
import { Header2 } from '@components/common/Header2';
import { colors } from '../../../styles/colors';
import { styles } from './style';
import { CustomButton } from '@components/common/CustomButton';
import { viewPrescriptions } from '@services/api/chatConsultationService';

// Type definitions
interface Doctor {
  name: string;
  credentials: string;
  signatureImage?: ImageSourcePropType;
  image?: ImageSourcePropType;
}

interface Clinic {
  name: string;
  location: string;
  specialization: string;
}

interface PatientInfo {
  name: string;
  age: string;
  gender: string;
}

interface Medication {
  id: number;
  name: string;
  description: string;
  startDate?: string;
  endDate?: string;
}

interface Prescription {
  id: string;
  doctor: Doctor;
  appointmentDate: string;
  appointmentTime: string;
  clinic: Clinic;
  patient: PatientInfo;
  medications?: Medication[];
  diagnosis?: string;
  treatmentName?: string;
  treatmentNotes?: string;
}

interface RouteParams {
  id?: string;
  consultationId?: string;
}

interface Props {
  route: {
    params?: RouteParams;
  };
  navigation: any;
}

export function PrescriptionDetail({ route, navigation }: Props) {
  const { t } = useTranslation();
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const consultationId = route?.params?.id || route?.params?.consultationId;

  useEffect(() => {
    if (consultationId) {
      fetchPrescriptionData();
    }
  }, [consultationId]);

  const fetchPrescriptionData = async (): Promise<void> => {
    if (!consultationId) {
      setError('Consultation ID is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setInfoMessage(null);

      const response = await viewPrescriptions(consultationId);
      console.log('Prescription response:', response);
      
      // Check if API returned success: false with a message
      if (response?.success === false) {
        const apiMessage = response?.message || 'No prescription available';
        setInfoMessage(apiMessage);
        setPrescription(null);
      } else {
        // Check if prescriptions array is empty
        // API structure: { success: true, data: {...consultation}, prescriptions: [...] }
        // Or when empty: { success: true, data: [] } or { success: true, data: {...}, prescriptions: [] }
        const prescriptions = response.prescriptions || [];
        const consultationData = response.data;
        
        // Check if data is an empty array (no consultation found)
        if (Array.isArray(consultationData) && consultationData.length === 0) {
          setInfoMessage('No prescription available');
          setPrescription(null);
        } 
        // Check if prescriptions array is empty (consultation exists but no prescriptions)
        else if (Array.isArray(prescriptions) && prescriptions.length === 0) {
          setInfoMessage('No prescription available for this consultation');
          setPrescription(null);
        } 
        // Map API response to prescription format
        else {
          const mappedPrescription = mapApiResponseToPrescription(response, consultationId);
          // Double check if medications array is empty after mapping
          if (!mappedPrescription.medications || mappedPrescription.medications.length === 0) {
            setInfoMessage('No prescription available for this consultation');
            setPrescription(null);
          } else {
            setPrescription(mappedPrescription);
            setInfoMessage(null);
          }
        }
      }
    } catch (err: any) {
      const errorMessage =
        err instanceof Error ? err.message : err?.response?.data?.message || 'An unknown error occurred';
      setError(errorMessage);
      setInfoMessage(null);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (): Promise<void> => {
    if (!consultationId) {
      Alert.alert('Error', 'Consultation ID is required to download prescription');
      return;
    }

    setIsDownloading(true);
    try {
      // For now, just show a success message
      // In the future, you can implement PDF generation similar to patient app
      Alert.alert('Success', 'Prescription download feature will be available soon');
    } catch (error: any) {
      console.error('Error downloading prescription:', error);
      Alert.alert('Error', error?.message || 'Failed to download prescription');
    } finally {
      setIsDownloading(false);
    }
  };

  // Map API response to Prescription format
  const mapApiResponseToPrescription = (apiResponse: any, consultationId: string): Prescription => {
    // Format date from ISO string
    const formatDate = (dateStr: string): string => {
      if (!dateStr) return '';
      try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
      } catch (e) {
        return dateStr;
      }
    };

    // Format time from ISO string
    const formatTime = (dateStr: string): string => {
      if (!dateStr) return '';
      try {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
      } catch (e) {
        return '';
      }
    };

    // Extract prescriptions from the response
    // API structure: { success: true, data: {...consultation}, prescriptions: [...] }
    // Or: { success: true, data: [] } when no prescriptions
    const prescriptions = apiResponse.prescriptions || apiResponse.data?.prescriptions || [];
    const consultationData = apiResponse.data && typeof apiResponse.data === 'object' && !Array.isArray(apiResponse.data) 
      ? apiResponse.data 
      : {};

    // Get appointment date/time from consultation data or first prescription
    const appointmentDateStr = consultationData.created_at || 
      (prescriptions[0]?.created_at) || 
      consultationData.date || 
      '';

    // Map medications from prescriptions array
    const rawMedications: Medication[] = Array.isArray(prescriptions)
      ? prescriptions.map((prescription: any, index: number) => ({
          id: prescription.id || index + 1,
          name: prescription.name || '',
          description: prescription.description || '',
          startDate: prescription.startDate,
          endDate: prescription.endDate,
        }))
      : [];

    // If one of the medication entries is the Diagnosis, extract it and remove from meds list
    const isDiagnosisEntry = (m: Medication) => typeof m.name === 'string' && m.name.trim().toLowerCase() === 'diagnosis';
    const diagnosisIndex = rawMedications.findIndex(isDiagnosisEntry);
    const diagnosisEntry = diagnosisIndex >= 0 ? rawMedications[diagnosisIndex] : undefined;
    const diagnosisText = diagnosisEntry ? (diagnosisEntry.description || '') : '';

    // Treatment entry: the item immediately after diagnosis in the original list (second one)
    let treatmentEntry: Medication | undefined;
    if (diagnosisIndex >= 0 && rawMedications.length > diagnosisIndex + 1) {
      treatmentEntry = rawMedications[diagnosisIndex + 1];
    }

    // Build medications list excluding diagnosis and treatment entries
    const medications = rawMedications.filter(m => m !== diagnosisEntry && m !== treatmentEntry);
    const treatmentName = treatmentEntry ? (treatmentEntry.name || '') : '';
    const treatmentNotes = treatmentEntry ? (treatmentEntry.description || '') : '';

    // Map doctor data from consultation data
    const doctorData = consultationData.doctor || {};
    const doctorImage = doctorData.image 
      ? { uri: doctorData.image } 
      : patient;
    const signatureImage = doctorData.signature
      ? { uri: doctorData.signature }
      : undefined;

    // Build doctor credentials
    const credentials = [
      doctorData.qualification,
      doctorData.specialization,
    ].filter(Boolean).join(', ') || 'Doctor';

    // Map clinic data (if available in consultation data)
    const clinicData = consultationData.clinic || {};
    
    // Map patient data from consultation data
    const patientData = consultationData.patient || {};

    // Map service data from consultation data
    const serviceData = consultationData.service || {};
    const capitalizeWords = (str: any) => {
      if (!str && str !== 0) return '';
      return String(str)
        .split(' ')
        .map(s => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s))
        .join(' ');
    };

    return {
      id: `#${consultationData.code || consultationId || 'N/A'}`,
      doctor: {
        name: doctorData.name || 'Dr. Unknown',
        credentials: credentials,
        signatureImage: signatureImage,
        image: doctorImage,
      },
      appointmentDate: formatDate(appointmentDateStr),
      appointmentTime: formatTime(appointmentDateStr),
      clinic: {
        name: clinicData.clinicName || clinicData.name || 'Clinic',
        location: clinicData.location || clinicData.city || '',
        specialization: serviceData.name
          ? capitalizeWords(serviceData.name)
          : serviceData.serviceType
          ? capitalizeWords(serviceData.serviceType)
          : '',
      },
      patient: {
        name: patientData.name || 'Patient',
        age: patientData.age || '',
        gender: patientData.gender ? capitalizeWords(patientData.gender) : '',
      },
      diagnosis: diagnosisText,
      treatmentName: treatmentName,
      treatmentNotes: treatmentNotes,
      medications: medications,
    };
  };

  // Loading State
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header2 title={t('screens.prescription')} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading prescription...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show info message (when success: false from API)
  if (!loading && !error && !prescription && infoMessage) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
        <Header2 title={t('screens.prescription')} />

        <View style={styles.noPrescriptionContainer}>
          <Text style={styles.noPrescriptionTitle}>{infoMessage}</Text>
          <Text style={styles.noPrescriptionSubtitle}>
            Prescription will appear here once it's created
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error State
  if (error && !infoMessage) {
    return (
      <SafeAreaView style={styles.container}>
        <Header2 title={t('screens.prescription')} />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchPrescriptionData}
            activeOpacity={0.8}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // If no prescription and no error, we've already handled it above
  if (!prescription) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      <Header2 title={prescription.id} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <DoctorCard
          doctor={prescription.doctor}
          date={prescription.appointmentDate}
          time={prescription.appointmentTime}
        />

        <View style={styles.infoGrid}>
          <InfoSection
            title="Clinic Information"
            items={[
              { label: 'Clinic Name', value: prescription.clinic.name },
              { label: 'Location', value: prescription.clinic.location },
              { label: 'Service Name', value: prescription.clinic.specialization },
            ]}
          />

          <InfoSection
            title="Patient Information"
            items={[
              { label: 'Patient Name', value: prescription.patient.name },
              { label: 'Age', value: prescription.patient.age },
              { label: 'Gender', value: prescription.patient.gender },
            ]}
          />
        </View>
       
        {prescription.diagnosis ? (
          <Section title="Diagnosis">
              <Text style={[styles.infoLabel,{textTransform:"capitalize"}]}>Summary:</Text>
              <Text style={styles.infoValue}>{prescription.diagnosis}</Text></Section>
        ) : null}
          {(prescription.treatmentName || prescription.treatmentNotes) && (
            <Section title="Treatment Details">
               {prescription.treatmentName ? (
                  <View style={styles.treatmentRow}>
                    <Text style={styles.treatmentLabel}>Treatment Name:</Text>
                    <Text style={styles.treatmentValue}>{prescription.treatmentName}</Text>
                  </View>
                ) : null}

                {prescription.treatmentNotes ? (
                  <View style={styles.treatmentNotesRow}>
                    <Text style={styles.treatmentNotesLabel}>Treatment Notes:</Text>
                    <Text style={styles.treatmentNotesValue}>{prescription.treatmentNotes}</Text>
                  </View>
                ) : null}
            </Section>
          )}
        {/* Medications Section */}
        {prescription.medications && prescription.medications.length > 0 ? (
          <Section title="Medications">
            {prescription.medications.map((medication,index) => (
              <MedicationCard
                key={medication.id}
                medication={medication}
                index={index}
              />
            ))}
          </Section>
        ) : (
          <View style={styles.noMedicationsContainer}>
            <Text style={styles.noMedicationsIcon}>💊</Text>
            <Text style={styles.noMedicationsTitle}>No Medications Prescribed</Text>
            <Text style={styles.noMedicationsMessage}>
              No medications have been prescribed for this consultation yet.
            </Text>
          </View>
        )}

        {prescription.doctor.signatureImage && (
          <Section title="Doctor's Signature" style={{borderBottomWidth: 0}}>
            <View style={styles.signatureBox}>
              <Image
                source={prescription.doctor.signatureImage}
                style={styles.signatureImage as any}
                resizeMode="contain"
              />
            </View>
          </Section>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.buttonWrapper}>
          <CustomButton title="Download" onPress={handleDownload} />
        </View>
      </View>

      <Modal
        visible={isDownloading}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.white} />
          <Text style={styles.downloadingText}>Downloading...</Text>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const DoctorCard: React.FC<{ doctor: Doctor; date: string; time: string }> = ({ doctor, date, time }) => {
  return (
    <View style={styles.doctorCard}>
      <Image 
        source={doctor.image || patient} 
        style={styles.avatar as any} 
      />
      <View style={styles.doctorInfo}>
        <Text style={styles.doctorName}>{doctor.name}</Text>
        <Text style={styles.doctorCredentials}>{doctor.credentials}</Text>
        <Text style={styles.dateTime}>
          {date} | {time}
        </Text>
      </View>
    </View>
  );
};

const InfoSection: React.FC<{ title: string; items: Array<{ label: string; value: string }> }> = ({ title, items }) => (
  <View style={styles.infoSection}>
    <Text style={styles.infoSectionTitle}>{title}</Text>
    {items.map((item, index) => (
      <View key={index} style={styles.infoItem}>
        <Text style={styles.infoLabel}>{item.label}</Text>
        <Text style={styles.infoValue}>{item.value || 'N/A'}</Text>
      </View>
    ))}
  </View>
);

const Section: React.FC<{ title: string;  children: React.ReactNode; style?: object }> = ({ title, style, children }) => (
  <View style={[styles.section, style || {}]}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const MedicationCard: React.FC<{ medication: Medication; index?: number }> = ({ medication, index }) => {
  // Calculate duration from startDate to endDate (fallback)
  let durationFromDates = '';
  if (medication.startDate && medication.endDate) {
    try {
      const start = new Date(medication.startDate);
      const end = new Date(medication.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      durationFromDates = diffDays === 0 ? '1 day' : `${diffDays + 1} days`;
    } catch (e) {
      durationFromDates = medication.endDate || '';
    }
  }

  // Parse description string into fields: Dosage, Duration, Instructions
  const parseDescription = (desc?: string) => {
    const result = { dosage: '', duration: '', instructions: '' };
    if (!desc) return result;
    const parts = desc.split(',').map(p => p.trim()).filter(Boolean);
    parts.forEach(part => {
      const [key, ...rest] = part.split(':');
      if (!key) return;
      const val = rest.join(':').trim();
      const k = key.trim().toLowerCase();
      if (k.includes('dosage')) result.dosage = val;
      else if (k.includes('duration')) result.duration = val;
      else if (k.includes('instruction') || k.includes('notes')) result.instructions = val;
      else {
        // append unknown parts to instructions
        result.instructions = result.instructions ? `${result.instructions}, ${part}` : part;
      }
    });
    return result;
  };

  const parsed = parseDescription(medication.description);
  const dosage = parsed.dosage || 'N/A';
  const duration = parsed.duration || durationFromDates || 'N/A';
  const instructions = parsed.instructions || '';

  return (
    <View style={styles.medicationCard}>
      {typeof index === 'number' && (
        <Text style={styles.medicineIndexLabel}>{`Medicine ${index + 1}:`}</Text>
      )}

      <TouchableOpacity activeOpacity={0.8}>
        <Text style={styles.medicineNameLink}>{medication.name}</Text>
      </TouchableOpacity>

      <View style={styles.medTwoColRow}>
        <View style={styles.medColumn}>
          <Text style={styles.medFieldLabel}>Dosage:</Text>
          <Text style={styles.medFieldValue}>{dosage}</Text>
        </View>

        <View style={styles.medColumn}>
          <Text style={styles.medFieldLabel}>Duration:</Text>
          <Text style={styles.medFieldValue}>{duration}</Text>
        </View>
      </View>

      {instructions ? (
        <>
          <Text style={styles.treatmentNotesLabel}>Treatment Notes:</Text>
          <Text style={styles.treatmentNotesValue}>{instructions}</Text>
        </>
      ) : null}
    </View>
  );
};

