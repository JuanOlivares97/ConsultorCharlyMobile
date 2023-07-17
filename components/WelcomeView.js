import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Icon from "react-native-vector-icons/FontAwesome";

Icon.loadFont();

const WelcomeView = ({ navigation }) => {
  const goToScanner = () => {
    navigation.navigate('ScannerView');
  };

  return (
    <View style={styles.contenedor}>


      <View style={styles.burbuja1}>

      </View>
      <Text style={styles.titulo}>¡Bienvenido!</Text>
      <Image style={styles.logo} source={require('../assets/supercharly-logo.png')} />
      <Text style={styles.slogan}>¡De todo al mejor precio!</Text>
      <TouchableOpacity onPress={goToScanner} style={styles.IngresarDiv}>
        
        <Text style={styles.ingresar}>Ingresar</Text><Icon name="arrow-right" size={30} color="white" />
      </TouchableOpacity>
      <View style={styles.burbuja2}>

      </View>


    </View>
  );
};

const styles = StyleSheet.create({
  contenedor:{
    
    height:'100%',
    display:'flex',
  },
  burbuja1:{
    position:'absolute',
    top:0,
    width:'100%',
    height:300,
    borderBottomRightRadius:560,
    backgroundColor:'blue'
  },
  burbuja2:{
    position:'absolute',
    bottom:0,
    width:'100%',
    height:300,
    borderTopLeftRadius:560,
    backgroundColor:'blue'
  },
  titulo:{
    color:'white',
    position:'absolute',
    top:50,
    left:45,
    fontSize:40
  },
  logo:{
    width:250,
    height:250,
    position:'absolute',
    top:50,
    left:25,
    resizeMode:'contain'
  },
  slogan:{
    position:'absolute',
    bottom:150,
    right:10,
    zIndex:1,
    color:'white',
    fontSize:28
  },
  ingresar:{
    color:'white',
    fontSize:40
  },
  IngresarDiv:{
    position:'absolute',
    right:10,
    bottom:50,
    zIndex:1,
    flexDirection:'row',
    alignItems:'center',
    gap:10
  }

})


export default WelcomeView;
