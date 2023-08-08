  import React, { useState, useEffect, useRef } from "react";
  import { View, Text, TouchableOpacity, Modal, StyleSheet, FlatList } from "react-native";
  import { Camera } from "expo-camera";
  import Icon from "react-native-vector-icons/FontAwesome";
  import { useIsFocused } from "@react-navigation/native";
  import AsyncStorage from '@react-native-async-storage/async-storage';

  Icon.loadFont();

  const ScannerView = () => {
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);
    const [productModalVisible, setProductModalVisible] = useState(false);
    const [cartModalVisible, setCartModalVisible] = useState(false);
    const [barcodeData, setBarcodeData] = useState("");
    const [productData, setProductData] = useState(null);
    const [isCameraActive, setCameraActive] = useState(true);
    const [cartItems, setCartItems] = useState([]);
    const isFocused = useIsFocused();
    const cameraRef = useRef(null);
    const [productNotFoundError, setProductNotFoundError] = useState(false);
    
    useEffect(() => {
      (async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === "granted");
      })();
    }, []);

    useEffect(() => {
      if (isFocused) {
        setScanned(false);
        setProductModalVisible(false);
        setCartModalVisible(false);
        setBarcodeData("");
        setProductData(null);
        setCameraActive(true);
      }
    }, [isFocused]);


    const saveCartItems = async (items) => {
      try {
        const jsonValue = JSON.stringify(items);
        await AsyncStorage.setItem('cartItems', jsonValue);
      } catch (error) {
        console.error('Error al guardar los datos del carrito:', error);
      }
    };

    const loadCartItems = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('cartItems');
        const items = JSON.parse(jsonValue);
        if (items) {
          setCartItems(items);
        }
      } catch (error) {
        console.error('Error al cargar los datos del carrito:', error);
      }
    };

    const handleBarCodeScanned = async ({ data }) => {
      if (!isCameraActive) return;
      
      setScanned(true);
      setBarcodeData(data);
      setProductModalVisible(true);
      setProductNotFoundError(false);

      try {
        const response = await fetch(
          `http://lowedev.cl/ConsultorCharlyAPI.php?code=${data} `
        );
        if (!response.ok) {
          throw new Error('Producto no encontrado'); // Manejar el error si la respuesta de la API no es exitosa
        }
        const json = await response.json();
        setProductData(json);
      } catch (error) {
        console.error(error);
        setProductData(null);
        setProductNotFoundError(true);
      }

      setTimeout(() => {
        setScanned(false);
      }, 2000);
    };

    const handleRescan = () => {
      setScanned(false);
      setProductModalVisible(false);
      setBarcodeData("");
      setProductData(null);
    };

    const handleAddToCart = () => {
      if (productData) {
        const { nombre, precio } = productData;
        const existingItem = cartItems.find((item) => item.nombre === nombre);
    
        if (existingItem) {
          existingItem.cantidad += 1;
        } else {
          const newItem = { nombre, precio, cantidad: 1 };
          cartItems.push(newItem);
        }
    
        setCartItems([...cartItems]);
        saveCartItems(cartItems);
      }
      setProductModalVisible(false);
    };
    

    const handleOpenCart = () => {
      setCartModalVisible(true);
      setCameraActive(false); // Desactivar la cámara al abrir el modal del carrito
    };
  
    const handleCloseCart = () => {
      setCartModalVisible(false);
      setCameraActive(true); // Activar la cámara al cerrar el modal del carrito
    };

    const handleIncrementQuantity = (index) => {
      const updatedCartItems = [...cartItems];
      updatedCartItems[index].cantidad++;
    
      // Recalcula el subtotal del producto con el descuento si la cantidad supera las 6 unidades
      if (updatedCartItems[index].cantidad >= 6) {
        const subtotal = updatedCartItems[index].precio * updatedCartItems[index].cantidad;
        const descuento = subtotal * 0.1; // 10% de descuento
        updatedCartItems[index].subtotal = subtotal - descuento;
      } else {
        // Si la cantidad es menor a 6 unidades, calcula el subtotal sin descuento
        updatedCartItems[index].subtotal = updatedCartItems[index].precio * updatedCartItems[index].cantidad;
      }
    
      setCartItems(updatedCartItems);
    };
    
    

    const handleDecrementQuantity = (index) => {
      const updatedCartItems = [...cartItems];
    
      if (updatedCartItems[index].cantidad > 1) {
        updatedCartItems[index].cantidad--;
    
        // Recalcula el subtotal del producto con el descuento si la cantidad supera las 6 unidades
        if (updatedCartItems[index].cantidad >= 6) {
          const subtotal = updatedCartItems[index].precio * updatedCartItems[index].cantidad;
          const descuento = subtotal * 0.1; // 10% de descuento
          updatedCartItems[index].subtotal = subtotal - descuento;
        } else {
          // Si la cantidad es menor a 6 unidades, calcula el subtotal sin descuento
          updatedCartItems[index].subtotal = updatedCartItems[index].precio * updatedCartItems[index].cantidad;
        }
    
        setCartItems(updatedCartItems);
      }
    };
    
    

    const handleRemoveItem = (index) => {
      const updatedCartItems = [...cartItems];
      updatedCartItems.splice(index, 1);
      setCartItems(updatedCartItems);
      saveCartItems(updatedCartItems);
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
      return <Text>No acceso a la camera</Text>;
    }

    
    return (
      <View style={styles.container}>
        <View style={styles.contentcam}>
        <Camera
          ref={cameraRef}
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={styles.camera}
          ratio="1:1"
        />
        </View>
        <Modal visible={productModalVisible} animationType="slide">
          <View style={styles.modalContent}>
          {productData && !productNotFoundError ? (
            <>
              <View style={styles.productContent}>
                <Text style={styles.productName}>{productData.nombre}</Text>
                <Text style={styles.productPrice}>${productData.precio}</Text>
              </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={handleRescan}>
                  <Text style={styles.buttonText}>Volver a escanear</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={handleAddToCart}>
                  <Text style={styles.buttonText}>Agregar al carrito</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.errorText}>
                {productNotFoundError ? "Producto no encontrado" : "Cargando..."}
              </Text>
              <TouchableOpacity style={styles.button} onPress={handleRescan}>
                <Text style={styles.buttonText}>Volver a escanear</Text>
              </TouchableOpacity>
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
        <TouchableOpacity style={styles.ShoppingCart } onPress={handleOpenCart}>
          <Icon name="shopping-cart" size={24} color="white" />
        </TouchableOpacity>
        
        <Modal
          visible={cartModalVisible}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.cartModal}>
            <Text style={styles.cartTitle}>Carrito de Compras</Text>
            {cartItems.map((item, index) => (
            <View key={item.codigo} style={styles.Product}>
              <Text style={styles.NombreProducto}>{item.nombre}</Text>
              <View style={styles.DivPrecioProducto}>
                <Text style={styles.TextPrecio}>Precio unitario:</Text>
                <Text style={styles.PrecioProducto}>${item.precio}</Text>
              </View>
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleDecrementQuantity(index)}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantityText}>{item.cantidad}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleIncrementQuantity(index)}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.DivPrecioProducto}>
                <Text style={styles.TextSubtotal}>Subtotal:</Text>
                <Text style={styles.Subtotal}>${item.precio*item.cantidad}</Text>  
              </View>
              <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveItem(index)}
                >
                  <Text style={styles.removeButtonText}>Eliminar</Text>
                </TouchableOpacity>
            </View>
            ))}
            <View style={styles.totalContainer}>
              <Text style={styles.totalText}>Total de la compra: ${getTotal()}</Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleCloseCart}
            >
              <Icon name="times" size={24} color="black" />

            </TouchableOpacity>
          </View>
        </Modal>
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor:'blue'
    },
    camera: {
      height: 300,
      width: "90%",
      aspectRatio: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    contentcam:{
      height: 310,
      width: 310,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor:'white'
    },
    modalContent: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    productName: {
      fontSize: 28,
      fontWeight: "bold",
      marginTop: 10,
      color:'blue',
      textAlign:'center'
    },
    productPrice: {
      fontSize: 80,
      marginBottom: 10,
      color: 'red',
      fontWeight: "bold",
    },
    buttonContainer: {
      position:'absolute',
      bottom:0,
      flex:1,
      flexDirection:'row'
    },
    button: {
      backgroundColor: "blue",
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderColor:'white',
      borderWidth:1
    },
    buttonText: {
      fontSize: 20,
      fontWeight: "bold",
      color: "white",
    },
    cartButton: {
      position: "absolute",
      top: 20,
      right: 20,
    },
    cartModal: {
      flex: 1,
      backgroundColor: "#ffffff",
      alignItems: "center",
      gap:10,
    },
    cartTitle: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 20,
      color: "black",
      marginTop:10
    },
    Product: {
      height: '32%',
      backgroundColor: "blue",
      width: "95%",
      alignItems: "center",
      borderRadius: 20,
    },
    NombreProducto: {
      color: "white",
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 30,
    },
    PrecioProducto: {
      color: "yellow",
      fontSize: 30,
    },
    Cantidad: {},
    DivPrecioProducto: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      width: "100%",
      marginLeft: 50,
      marginBottom: 20,
    },
    TextPrecio: {
      color: "white",
      fontSize: 20,
    },
    quantityContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 20,
      marginBottom:20
    },
    quantityButton: {
      backgroundColor: "white",
      width: 20,
      height: 20,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 8,
    },
    quantityButtonText: {
      color: "black",
      fontWeight: "bold",
    },
    quantityText: {
      color: "white",
      fontSize: 15,
    },
    TextSubtotal: {
      color: "white",
      fontSize: 20,
      marginRight:55
    },
    Subtotal: {
      color: "yellow",
      fontSize: 30,
    },
    totalContainer:{
      position:'absolute',
      bottom:0,
      width:'100%',
      backgroundColor:'blue',
      justifyContent:'center',
      alignItems:'center',
      height:40
    },
    closeButton:{
      position:'absolute',
      top:17,
      right:10
    },
    totalText:{
        color:'white'
    },
    removeButtonText:{
      marginTop:-20,
      color:'red'
    },
    ShoppingCart:{
      position:'absolute',
      top:'5%',
      right:'5%',
    },
    productContent:{
      height:300,
      width:'90%',
      backgroundColor:'yellow',
      alignItems:'center',
      justifyContent:'center'
    }
  });

  export default ScannerView;
