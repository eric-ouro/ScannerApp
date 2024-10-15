import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, FlatList, Alert, TouchableOpacity } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { Picker } from '@react-native-picker/picker';

export default function TransferScreen() {
  const [currentCompany, setCurrentCompany] = useState('1');
  const [currentFacility, setCurrentFacility] = useState('1');
  const [destinationCompany, setDestinationCompany] = useState('1');
  const [destinationFacility, setDestinationFacility] = useState('1');
  const [baleIDs, setBaleIDs] = useState<string[]>([]);
  const [scanning, setScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const onBarcodeScan = async ({ data: scannedValue }: { data: string }) => {
    if (isProcessing) return;
    setIsProcessing(true);

    if (!isNaN(Number(scannedValue))) {
      if (baleIDs.includes(scannedValue)) {
        Alert.alert('Duplicate Bale ID', 'This bale ID has already been scanned.');
        setIsProcessing(false);
        return;
      }

      try {
        const response = await fetch(`http://ec2-3-89-122-120.compute-1.amazonaws.com/transactions/latest?barcode_id=${scannedValue}`);
        const json = await response.json();
        if (json.latest_transaction) {
          setBaleIDs((prev) => [...prev, scannedValue]);
        } else {
          Alert.alert('No Transaction', 'No latest transaction found for this barcode.');
        }
      } catch (error) {
        Alert.alert('Error', 'Error fetching data from the server.');
      }
    } else {
      Alert.alert('Invalid QR Code', `${scannedValue} is not a number.`);
    }
    setScanning(false);
    setIsProcessing(false);
  };

  const submitTransaction = async () => {
    const barcodeIDs = baleIDs.map(id => parseInt(id, 10));
    const outputFacility = parseInt(destinationFacility, 10);
    const outputCompany = parseInt(destinationCompany, 10);

    try {
      const response = await fetch('http://ec2-3-89-122-120.compute-1.amazonaws.com/transactions/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          barcodeIDs,
          outputFacility,
          outputCompany,
        }),
      });

      const json = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'Transaction submitted successfully.');
        setBaleIDs([]); // Clear the bale IDs after successful submission
      } else {
        Alert.alert('Error', json.message || 'Failed to submit transaction.');
      }
    } catch (error) {
      Alert.alert('Error', 'Error submitting transaction.');
    }
  };

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      {scanning ? (
        <>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            onBarcodeScanned={onBarcodeScan}
          />
          <TouchableOpacity style={styles.closeButton} onPress={() => setScanning(false)}>
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.title}>Transfer Details</Text>
          <Picker
            selectedValue={currentCompany}
            style={styles.picker}
            onValueChange={(itemValue) => setCurrentCompany(itemValue)}
          >
            {Array.from({ length: 15 }, (_, i) => i + 1).map((num) => (
              <Picker.Item key={num} label={`Current Company ${num}`} value={`${num}`} />
            ))}
          </Picker>

          <Picker
            selectedValue={currentFacility}
            style={styles.picker}
            onValueChange={(itemValue) => setCurrentFacility(itemValue)}
          >
            {Array.from({ length: 15 }, (_, i) => i + 1).map((num) => (
              <Picker.Item key={num} label={`Current Facility ${num}`} value={`${num}`} />
            ))}
          </Picker>

          <Picker
            selectedValue={destinationCompany}
            style={styles.picker}
            onValueChange={(itemValue) => setDestinationCompany(itemValue)}
          >
            {Array.from({ length: 15 }, (_, i) => i + 1).map((num) => (
              <Picker.Item key={num} label={`Destination Company ${num}`} value={`${num}`} />
            ))}
          </Picker>

          <Picker
            selectedValue={destinationFacility}
            style={styles.picker}
            onValueChange={(itemValue) => setDestinationFacility(itemValue)}
          >
            {Array.from({ length: 15 }, (_, i) => i + 1).map((num) => (
              <Picker.Item key={num} label={`Destination Facility ${num}`} value={`${num}`} />
            ))}
          </Picker>

          <FlatList
            data={baleIDs}
            keyExtractor={(item) => item}
            renderItem={({ item }) => <Text style={styles.baleID}>{item}</Text>}
            ListEmptyComponent={<Text style={styles.emptyText}>No Bale IDs</Text>}
          />

          <View style={styles.buttonContainer}>
            <Button title="Scan in Bales" onPress={() => setScanning(true)} />
            <Button title="Submit Transaction" onPress={submitTransaction} />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 20,
  },
  baleID: {
    fontSize: 16,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  emptyText: {
    textAlign: 'center',
    color: '#aaa',
    marginVertical: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 10,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
  },
});
