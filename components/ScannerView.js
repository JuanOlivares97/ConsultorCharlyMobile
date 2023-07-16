import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Camera } from 'expo-camera';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useIsFocused } from '@react-navigation/native';

Icon.loadFont();

const ScannerView = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [cartModalVisible, setCartModalVisible] = useState(false);
  const [barcodeData, setBarcodeData] = useState('');
  const [productData, setProductData] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const isFocused = useIsFocused();
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    if (isFocused) {
      setScanned(false);
      setProductModalVisible(false);
      setCartModalVisible(true);
      setBarcodeData('');
      setProductData(null);
    }
  }, [isFocused]);

  const handleBarCodeScanned = async ({ data }) => {
    setScanned(true);
    setBarcodeData(data);
    setProductModalVisible(true);

    try {
      const response = await fetch(`http://lowedev.cl/ConsultorCharlyAPI.php?code=${data} `);
      const json = await response.json();
      setProductData(json);
    } catch (error) {
      console.error(error);
    }

    setTimeout(() => {
      setScanned(false);
    }, 2000);
  };

  const handleRescan = () => {
    setScanned(false);
    setProductModalVisible(false);
    setBarcodeData('');
    setProductData(null);
  };

  const handleAddToCart = () => {
    if (productData) {
      const { nombre, precio } = productData;
      const newItem = { nombre, precio, cantidad: 1 };
      setCartItems([...cartItems, newItem]);
    }
    setProductModalVisible(false);
  };

  const handleOpenCart = () => {
    setCartModalVisible(true);
  };

  const handleCloseCart = () => {
    setCartModalVisible(false);
  };

  const handleIncrementQuantity = (index) => {
    const updatedCartItems = [...cartItems];
    updatedCartItems[index].cantidad++;
    setCartItems(updatedCartItems);
  };

  const handleDecrementQuantity = (index) => {
    const updatedCartItems = [...cartItems];
    if (updatedCartItems[index].cantidad > 1) {
      updatedCartItems[index].cantidad--;
      setCartItems(updatedCartItems);
    }
  };

  const handleRemoveItem = (index) => {
    const updatedCartItems = [...cartItems];
    updatedCartItems.splice(index, 1);
    setCartItems(updatedCartItems);
  };

  const getTotal = () => {
    let total = 0;
    cartItems.forEach((item) => {
      const subtotal = item.precio * item.cantidad;
      total += subtotal;
    });
    return total;
  };

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={styles.camera}
        ratio="1:1"
      />
      <Modal visible={productModalVisible} animationType="slide">
        <View style={styles.modalContent}>
          {productData && (
            <>
              <Text style={styles.productName}>{productData.nombre}</Text>
              <Text style={styles.productPrice}>{productData.precio}</Text>
            </>
          )}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={handleRescan}>
              <Text style={styles.buttonText}>Volver a escanear</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleAddToCart}>
              <Text style={styles.buttonText}>Agregar al carrito</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <TouchableOpacity style={styles.cartButton} onPress={handleOpenCart}>
        <Icon name="shopping-cart" size={24} color="black" />
      </TouchableOpacity>

      <Modal visible={cartModalVisible} animationType="slide" transparent={true}>
        <View style={styles.cartModal}>
          <Text style={styles.cartTitle}>Carrito de Compras</Text>
          
            <View style={styles.Product}>
              
            </View>

          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>Total de la compra: {getTotal()}</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={handleCloseCart}>
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    height: 300,
    width: '90%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  productPrice: {
    fontSize: 16,
    marginBottom: 10,
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  cartButton: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  cartModal: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems:'center'
  },
  cartTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'black',
  },
  Product:{
    height: 225,
    backgroundColor:'red',
    width: '95%',
  }
});

export default ScannerView;
