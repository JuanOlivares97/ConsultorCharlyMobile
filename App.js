import { NavigationContainer } from '@react-navigation/native';
import * as React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

//Views
import WelcomeView from './components/WelcomeView';
import ScannerView from './components/ScannerView';


const Stack = createNativeStackNavigator();

const App = () => {
  
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen options={{ headerShown: false }} name="WelcomeView"  component={WelcomeView} />
        <Stack.Screen options={{ headerShown: false }} name="ScannerView" component={ScannerView} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};



export default App;
