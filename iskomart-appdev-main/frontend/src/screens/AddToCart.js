import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, FlatList, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { URL } from '../config';

const AddToCart = ({ route, navigation }) => {
  const { user_id } = route.params || {};
  const [selectAll, setSelectAll] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch cart items from database
  useEffect(() => {
    fetchCartItems();
  }, [user_id]);

  const fetchCartItems = async () => {
    if (!user_id) {
      Alert.alert('Error', 'User ID not found');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`${URL}/api/cart/${user_id}`);
      if (response.data.success) {
        const cartItems = response.data.cartItems.map(item => ({
          id: item.item_id,
          cart_id: item.cart_id,
          name: item.item_name,
          price: parseFloat(item.item_price),
          quantity: item.quantity,
          checked: false,
          image: item.item_photo ? { uri: item.item_photo } : require('../assets/items/1.jpg'),
          seller_id: item.seller_id,
          seller_name: item.seller_username
        }));
        setItems(cartItems);
      }
    } catch (error) {
      console.error('Error fetching cart items:', error);
      Alert.alert('Error', 'Failed to load cart items');
    } finally {
      setLoading(false);
    }
  };

  const toggleCheck = (id) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const toggleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setItems(items.map(item => ({ ...item, checked: newSelectAll })));
  };

  const updateQuantity = async (id, change) => {
    const item = items.find(item => item.id === id);
    const newQuantity = Math.max(0, item.quantity + change);
    
    try {
      if (newQuantity === 0) {
        // Remove item from cart
        await axios.delete(`${URL}/api/cart/remove`, {
          data: { user_id, item_id: id }
        });
        setItems(items.filter(item => item.id !== id));
      } else {
        // Update quantity
        await axios.put(`${URL}/api/cart/update`, {
          user_id,
          item_id: id,
          quantity: newQuantity
        });
        setItems(items.map(item => 
          item.id === id ? { ...item, quantity: newQuantity } : item
        ));
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      Alert.alert('Error', 'Failed to update quantity');
    }
  };

  const placeOrder = () => {
    const selectedItems = items.filter(item => item.checked && item.quantity > 0);
    
    if (selectedItems.length === 0) {
      Alert.alert('Error', 'Please select items to chat about');
      return;
    }

    // Get unique sellers from selected items
    const sellers = [...new Set(selectedItems.map(item => ({ 
      seller_id: item.seller_id, 
      seller_name: item.seller_name 
    })))];

    if (sellers.length === 1) {
      // If only one seller, navigate directly to chat
      const seller = sellers[0];
      Alert.alert(
        'Contact Seller', 
        `You will be redirected to chat with ${seller.seller_name} to discuss your order.`,
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Chat Now',
            onPress: () => {
              navigation.navigate('ChatPage', {
                user_id: user_id,
                receiver_id: seller.seller_id,
                userName: seller.seller_name,
                orderContext: true,
                selectedItems: selectedItems.map(item => ({
                  id: item.id,
                  name: item.name,
                  price: item.price,
                  quantity: item.quantity
                }))
              });
            }
          }
        ]
      );
    } else {
      // Multiple sellers
      Alert.alert(
        'Multiple Sellers', 
        `You have selected items from ${sellers.length} different sellers. You'll need to chat with each seller separately.`,
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Go to Messages',
            onPress: () => {
              navigation.navigate('Messaging', { 
                user_id,
                sellersToContact: sellers
              });
            }
          }
        ]
      );
    }
  };

  const total = items
    .filter(item => item.checked && item.quantity > 0)
    .reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const renderItem = ({ item }) => (
    <View style={styles.itemCard}>
      <TouchableOpacity 
        style={styles.checkbox}
        onPress={() => toggleCheck(item.id)}
      >
        <View style={[
          styles.checkboxInner,
          item.checked && styles.checkboxChecked
        ]} />
      </TouchableOpacity>
      
      <Image source={item.image} style={styles.itemImage} />
      
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>₱{item.price.toFixed(2)}</Text>
        <Text style={styles.sellerName}>Sold by: {item.seller_name}</Text>
      </View>
      
      <View style={styles.quantityContainer}>
        <TouchableOpacity 
          style={styles.quantityButton}
          onPress={() => updateQuantity(item.id, -1)}
        >
          <Text style={styles.quantityButtonText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.quantity}>{item.quantity}</Text>
        <TouchableOpacity 
          style={styles.quantityButton}
          onPress={() => updateQuantity(item.id, 1)}
        >
          <Text style={styles.quantityButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Loading cart...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Logo */}
      <View style={styles.header}>
        <Image source={require('../assets/logo.png')} style={styles.logo} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor="#999"
        />
        <Icon name="search" size={20} color="#999" style={styles.searchIcon} />
      </View>

      {/* Title */}
      <Image source={require('../assets/shoppingcart.png')} />

      {/* Cart Items */}
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        style={styles.itemsList}
        ListEmptyComponent={
          <View style={styles.emptyCart}>
            <Text style={styles.emptyCartText}>Your cart is empty</Text>
          </View>
        }
      />

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerContent}>
          <TouchableOpacity 
            style={styles.selectAllContainer}
            onPress={toggleSelectAll}
          >
            <View style={[
              styles.selectAllCheckbox,
              selectAll && styles.checkboxChecked
            ]} />
            <Text style={styles.selectAllText}>All</Text>
          </TouchableOpacity>
          
          <View style={styles.totalSection}>
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>₱{total.toFixed(2)}</Text>
            </View>
            <TouchableOpacity 
              style={styles.placeOrderButton}
              onPress={placeOrder}
            >
              <Text style={styles.placeOrderText}>Contact Seller</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.navigate('Home', { user_id })}>
          <Icon name="home-outline" size={28} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('AddToCart', { user_id })}>
          <Icon name="cart-outline" size={28} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('AddPost', { user_id })}>
          <Icon name="add-circle-outline" size={28} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Messaging', { user_id })}>
          <Icon name="mail-outline" size={28} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Profile', { user_id })}>
          <Icon name="person-outline" size={28} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
container: {
    flex: 1,
    backgroundColor: '#f9f5e8',
},
header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9C2D0',
    paddingHorizontal: 20,
    paddingVertical: 10,
},
logo: {
    width: 50,
    height: 50,
},
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    position: 'relative',
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#000',
    paddingRight: 50,
  },
  searchIcon: {
    position: 'absolute',
    right: 35,
    top: 27,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    marginBottom: 20,
    fontFamily: 'serif',
  },
  itemsList: {
    flex: 1,
    paddingHorizontal: 15,
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 3,
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxInner: {
    width: 12,
    height: 12,
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: '#f9c2d0',
  },
  itemImage: {
    width: 80,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
    resizeMode: 'cover',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  itemPrice: {
    fontSize: 16,
    color: '#f9c2d0',
    fontWeight: 'bold',
  },
  sellerName: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9c2d0',
    borderRadius: 20,
    paddingHorizontal: 5,
  },
  quantityButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantity: {
    paddingHorizontal: 15,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyCartText: {
    fontSize: 18,
    color: '#666',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingBottom: 10, // Account for bottom navigation
  },
  footerContent: {
    padding: 20,
  },
  selectAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  selectAllCheckbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 10,
    marginRight: 10,
  },
  selectAllText: {
    fontSize: 16,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalContainer: {
    alignItems: 'flex-start',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f9c2d0',
  },
  placeOrderButton: {
    backgroundColor: '#f9c2d0',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  placeOrderText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#FFDC9A',
    borderRadius: 110,
    marginHorizontal: 30,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    borderWidth: 2,
    borderColor: '#000',
  },
});

export default AddToCart;