import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  TextInput,
  ScrollView,
  Modal,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import DatePicker from 'react-native-date-picker';

// Medicine type definition
interface Medicine {
  name: string;
  startDate: string;
  timing: string;
  expiryDate: string;
  dosage: string;
  endDate: string;
}

const ScanPage: React.FC = () => {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showMedicineForm, setShowMedicineForm] = useState(false);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [newMedicine, setNewMedicine] = useState<Medicine>({
    name: '',
    startDate: '',
    timing: '',
    expiryDate: '',
    dosage: '',
    endDate: '',
  });
  
  // Date picker states
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showExpiryDatePicker, setShowExpiryDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [startDateObj, setStartDateObj] = useState(new Date());
  const [expiryDateObj, setExpiryDateObj] = useState(new Date());
  const [endDateObj, setEndDateObj] = useState(new Date());

  // Format date to string in YYYY-MM-DD format
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Parse string date to Date object
  const parseDate = (dateStr: string): Date => {
    if (!dateStr) return new Date();
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  // Check if date1 is before date2
  const isDateBefore = (date1: Date, date2: Date): boolean => {
    return date1.getTime() < date2.getTime();
  };

  // Date picker handlers
  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(false); // For Android we need to close the modal
    if (selectedDate) {
      setStartDateObj(selectedDate);
      setNewMedicine({
        ...newMedicine,
        startDate: formatDate(selectedDate),
      });
    }
  };

  const handleExpiryDateChange = (event: any, selectedDate?: Date) => {
    setShowExpiryDatePicker(false);
    if (selectedDate) {
      setExpiryDateObj(selectedDate);
      setNewMedicine({
        ...newMedicine,
        expiryDate: formatDate(selectedDate),
      });
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setEndDateObj(selectedDate);
      setNewMedicine({
        ...newMedicine,
        endDate: formatDate(selectedDate),
      });
    }
  };

  const openCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      alert("You need to grant camera permission to use this feature");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const openFilePicker = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleAddMedicine = () => {
    setShowMedicineForm(true);
  };

  const handleFormChange = (field: keyof Medicine, value: string) => {
    setNewMedicine({
      ...newMedicine,
      [field]: value,
    });
  };

  const handleSubmitMedicine = () => {
    // Basic validation
    if (!newMedicine.name.trim()) {
      alert('Please enter medicine name');
      return;
    }
    if (!newMedicine.startDate.trim()) {
      alert('Please select start date');
      return;
    }
    if (!newMedicine.timing.trim()) {
      alert('Please enter timing');
      return;
    }
    if (!newMedicine.dosage.trim()) {
      alert('Please enter dosage quantity');
      return;
    }
    if (!newMedicine.endDate.trim()) {
      alert('Please select end date');
      return;
    }
    if (!newMedicine.expiryDate.trim()) {
      alert('Please select expiry date');
      return;
    }

    // Validate that end date is after or equal to start date
    const startDate = parseDate(newMedicine.startDate);
    const endDate = parseDate(newMedicine.endDate);
    const expiryDate = parseDate(newMedicine.expiryDate);
    
    if (!isDateBefore(startDate, endDate) && startDate.getTime() !== endDate.getTime()) {
      alert('End date must be on or after the start date');
      return;
    }

    // Validate that expiry date is after start date
    if (!isDateBefore(startDate, expiryDate)) {
      alert('Expiry date must be after the start date');
      return;
    }

    console.log('New Medicine Data:', newMedicine);

    setMedicines([...medicines, newMedicine]);
    setNewMedicine({
      name: '',
      startDate: '',
      timing: '',
      expiryDate: '',
      dosage: '',
      endDate: '',
    });
    setShowMedicineForm(false);
  };

  const openStartDatePicker = () => {
    setShowStartDatePicker(true);
  };

  const openEndDatePicker = () => {
    setShowEndDatePicker(true);
  };

  const openExpiryDatePicker = () => {
    setShowExpiryDatePicker(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#4361ee', '#3a0ca3']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scan Prescription</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      {/* Main Content */}
      <View style={styles.content}>
        {selectedImage ? (
          <ScrollView style={styles.scrollContainer}>
            <View style={styles.previewContainer}>
              <Image source={{ uri: selectedImage }} style={styles.preview} />
              <TouchableOpacity 
                style={styles.button} 
                onPress={() => setSelectedImage(null)}
              >
                <LinearGradient
                  colors={['#4361ee', '#3a0ca3']}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.buttonText}>Choose Different Image</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Display added medicines */}
              {medicines.length > 0 && (
                <View style={styles.medicineList}>
                  <Text style={styles.medicineListTitle}>Added Medicines:</Text>
                  {medicines.map((med, index) => (
                    <View key={index} style={styles.medicineItem}>
                      <Text style={styles.medicineName}>{med.name}</Text>
                      <Text style={styles.medicineDetails}>
                        Start: {med.startDate} | End: {med.endDate}
                      </Text>
                      <Text style={styles.medicineDetails}>
                        Timing: {med.timing} | Dosage: {med.dosage}
                      </Text>
                      <Text style={styles.medicineDetails}>
                        Expiry: {med.expiryDate}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>
        ) : (
          <>
            <TouchableOpacity style={styles.button} onPress={openCamera}>
              <LinearGradient
                colors={['#4361ee', '#3a0ca3']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.buttonText}>📷 Open Camera</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={openFilePicker}>
              <LinearGradient
                colors={['#4361ee', '#3a0ca3']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.buttonText}>📁 Choose File</Text>
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}
        
        {/* Add Medicine Button - Always visible */}
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleAddMedicine}
        >
          <LinearGradient
            colors={['#4361ee', '#3a0ca3']}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.buttonText}>Add Medicine</Text>
          </LinearGradient>
        </TouchableOpacity>
             
      </View>

      {/* Medicine Form Modal */}
      <Modal
        visible={showMedicineForm}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowMedicineForm(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Add Medicine Details</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Medicine Name</Text>
              <TextInput
                style={styles.input}
                value={newMedicine.name}
                onChangeText={(text) => handleFormChange('name', text)}
                placeholder="Enter medicine name"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Start Date</Text>
              <TouchableOpacity 
                style={styles.dateInput}
                onPress={openStartDatePicker}
              >
                <Text style={newMedicine.startDate ? styles.dateText : styles.datePlaceholder}>
                  {newMedicine.startDate ? newMedicine.startDate : "Select Start Date"}
                </Text>
              </TouchableOpacity>
              {showStartDatePicker && Platform.OS === 'android' && (
                <DatePicker
                  mode="date"
                  date={startDateObj}
                  onDateChange={(date) => {
                    setStartDateObj(date);
                    setNewMedicine({
                      ...newMedicine,
                      startDate: formatDate(date),
                    });
                    setShowStartDatePicker(false);
                  }}
                />
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>End Date</Text>
              <TouchableOpacity 
                style={styles.dateInput}
                onPress={openEndDatePicker}
              >
                <Text style={newMedicine.endDate ? styles.dateText : styles.datePlaceholder}>
                  {newMedicine.endDate ? newMedicine.endDate : "Select End Date"}
                </Text>
              </TouchableOpacity>
              {showEndDatePicker && Platform.OS === 'android' && (
                <DatePicker
                  mode="date"
                  date={endDateObj}
                  minimumDate={parseDate(newMedicine.startDate) || undefined}
                  onDateChange={(date) => {
                    setEndDateObj(date);
                    setNewMedicine({
                      ...newMedicine,
                      endDate: formatDate(date),
                    });
                    setShowEndDatePicker(false);
                  }}
                />
              )}
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Timing</Text>
              <TextInput
                style={styles.input}
                value={newMedicine.timing}
                onChangeText={(text) => handleFormChange('timing', text)}
                placeholder="e.g., Morning, After meals"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Dosage Quantity</Text>
              <TextInput
                style={styles.input}
                value={newMedicine.dosage}
                onChangeText={(text) => handleFormChange('dosage', text)}
                placeholder="e.g., 1 pill, 2 tablets, 5ml"
                keyboardType="default"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Expiry Date</Text>
              <TouchableOpacity 
                style={styles.dateInput}
                onPress={openExpiryDatePicker}
              >
                <Text style={newMedicine.expiryDate ? styles.dateText : styles.datePlaceholder}>
                  {newMedicine.expiryDate ? newMedicine.expiryDate : "Select Expiry Date"}
                </Text>
              </TouchableOpacity>
              {showExpiryDatePicker && Platform.OS === 'android' && (
                <DatePicker
                  mode="date"
                  date={expiryDateObj}
                  minimumDate={parseDate(newMedicine.startDate) || undefined}
                  onDateChange={(date) => {
                    setExpiryDateObj(date);
                    setNewMedicine({
                      ...newMedicine,
                      expiryDate: formatDate(date),
                    });
                    setShowExpiryDatePicker(false);
                  }}
                />
              )}
            </View>
            
            <View style={styles.formActions}>
              <TouchableOpacity 
                style={[styles.formButton, styles.cancelButton]} 
                onPress={() => setShowMedicineForm(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.formButton, styles.submitButton]} 
                onPress={handleSubmitMedicine}
              >
                <Text style={styles.submitButtonText}>Add Medicine</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    fontSize: 24,
    color: 'white',
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 20,
  },
  button: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#4361ee',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonGradient: {
    padding: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  previewContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  preview: {
    width: '100%',
    height: 400,
    borderRadius: 16,
    marginBottom: 20,
  },
  scrollContainer: {
    flex: 1,
    width: '100%',
  },
  medicineList: {
    marginTop: 20,
    width: '100%',
    backgroundColor: '#f1f5f9',
    padding: 16,
    borderRadius: 12,
  },
  medicineListTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#334155',
  },
  medicineItem: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4361ee',
  },
  medicineName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#1e293b',
  },
  medicineDetails: {
    fontSize: 14,
    color: '#64748b',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 500,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    color: '#1e293b',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 6,
    color: '#334155',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8fafc',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  formButton: {
    borderRadius: 8,
    padding: 14,
    flexBasis: '48%',
  },
  cancelButton: {
    backgroundColor: '#e2e8f0',
  },
  cancelButtonText: {
    color: '#334155',
    textAlign: 'center',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#4361ee',
  },
  submitButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#1e293b',
  },
  datePlaceholder: {
    fontSize: 16,
    color: '#94a3b8',
  },
});

export default ScanPage;
