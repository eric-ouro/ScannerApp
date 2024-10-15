// App.js
import { TouchableOpacity } from 'react-native';

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Alert, Platform } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { enableScreens } from 'react-native-screens';

enableScreens(); // Add this line at the top of your file

export default function App() {
  const [scanning, setScanning] = useState(false);
  const [data, setData] = useState(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const onBarcodeScan = ({ data: scannedValue }: { data: string }) => {
    console.log('Scanned QR Code Value:', scannedValue); // Log the scanned value to the console
    if (!isNaN(Number(scannedValue))) {
      // It's a number, fetch data from the endpoint
      fetchData(scannedValue);
    } else {
      Alert.alert('Invalid QR Code', `${scannedValue} is not a number.`);
    }
    setScanning(false);
  };

  const fetchData = async (barcode_id: string) => {
    console.log('Fetching data for barcode ID:', barcode_id);
    try {
      const response = await fetch(`http://ec2-3-89-122-120.compute-1.amazonaws.com/transactions/latest?barcode_id=${barcode_id}`);
      const json = await response.json();
      setData(json);
    } catch (error) {
      Alert.alert('Error', 'Error fetching data from the server.');
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
            onBarcodeScanned={(onBarcodeScan)}
          />
          <TouchableOpacity style={styles.closeButton} onPress={() => setScanning(false)}>
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Button title="Scan QR Code" onPress={() => setScanning(true)} />
          </View>
          {data && (
            <Text style={styles.dataText}>{JSON.stringify(data, null, 2)}</Text>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dataText: {
    marginTop: 20,
    fontSize: 16,
    paddingHorizontal: 20,
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
