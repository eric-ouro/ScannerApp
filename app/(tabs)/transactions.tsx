import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';

export default function TransactionsScreen() {
  const [selectedType, setSelectedType] = useState('create');
  const navigation = useNavigation();


  const handleNewTransaction = () => {
    if (selectedType === 'transfer') {
      navigation.navigate('transfer');
    } else {
      alert('New Transaction');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Transaction Type</Text>
      <Picker
        selectedValue={selectedType}
        style={styles.picker}
        onValueChange={(itemValue) => setSelectedType(itemValue)}
      >
        <Picker.Item label="Create" value="create" />
        <Picker.Item label="Transfer" value="transfer" />
      </Picker>
      <Button title="New Transaction" onPress={handleNewTransaction} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  picker: {
    height: 50,
    width: 200,
    marginBottom: 20,
  },
});