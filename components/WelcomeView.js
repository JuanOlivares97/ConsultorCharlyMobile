import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const WelcomeView = ({ navigation }) => {
  const goToScanner = () => {
    navigation.navigate('ScannerView');
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24 }}>¡Bienvenido!</Text>
      <Text style={{ fontSize: 16, marginTop: 10 }}>De todo al mejor precio</Text>
      <TouchableOpacity onPress={goToScanner} style={{ marginTop: 20 }}>
        <Text style={{ fontSize: 18, color: 'blue' }}>Ingresar</Text>
      </TouchableOpacity>
    </View>
  );
};

export default WelcomeView;
