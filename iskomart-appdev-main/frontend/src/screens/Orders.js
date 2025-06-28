import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { URL } from '../config';

const Orders = ({ route, navigation }) => {
  const { user_id } = route.params || {};
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('buying'); // 'buying' or 'selling'

  useEffect(() => {
    fetchOrders();
  }, [user_id, activeTab]);

  const fetchOrders = async () => {
    if (!user_id) return;
    
    try {
      setLoading(true);
      const endpoint = activeTab === 'buying' 
        ? `${URL}/api/orders/buyer/${user_id}`
        : `${URL}/api/orders/seller/${user_id}`;
      
      const response = await axios.get(endpoint);
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (order_id, status) => {
    try {
      const response = await axios.put(`${URL}/text/orders/status/${user_id}`, {
        order_id,
        status
      });

      if (response.data.success) {
        Alert.alert('Success', 'Order status updated successfully');
        fetchOrders(); // Refresh orders
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      Alert.alert('Error', 'Failed to update order status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'confirmed': return '#28a745';
      case 'shipped': return '#007bff';
      case 'delivered': return '#28a745';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const renderOrder = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Order #${item.order_id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      
      <View style={styles.orderDetails}>
        <Text style={styles.orderAmount}>₱{parseFloat(item.total_amount).toFixed(2)}</Text>
        <Text style={styles.orderDate}>
          {new Date(item.order_date).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.userInfo}>
        <Text style={styles.userLabel}>
          {activeTab === 'buying' ? 'Seller:' : 'Buyer:'}
        </Text>
        <Text style={styles.userName}>
          {activeTab === 'buying' 
            ? `${item.seller_first_name || ''} ${item.seller_last_name || ''}`.trim() || item.seller_username
            : `${item.buyer_first_name || ''} ${item.buyer_last_name || ''}`.trim() || item.buyer_username
          }
        </Text>
      </View>

      {item.delivery_address && (
        <Text style={styles.address}>📍 {item.delivery_address}</Text>
      )}

      <View style={styles.orderActions}>
        <TouchableOpacity
          style={styles.chatButton}
          onPress={() => navigation.navigate('ChatPage', {
            user_id,
            receiver_id: activeTab === 'buying' ? item.seller_id : item.buyer_id,
            userName: activeTab === 'buying' 
              ? `${item.seller_first_name || ''} ${item.seller_last_name || ''}`.trim() || item.seller_username
              : `${item.buyer_first_name || ''} ${item.buyer_last_name || ''}`.trim() || item.buyer_username
          })}
        >
          <Icon name="chatbubble-outline" size={20} color="#007bff" />
          <Text style={styles.chatButtonText}>Chat</Text>
        </TouchableOpacity>

        {/* Status update buttons for sellers */}
        {activeTab === 'selling' && item.status === 'pending' && (
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={() => updateOrderStatus(item.order_id, 'confirmed')}
          >
            <Text style={styles.confirmButtonText}>Confirm</Text>
          </TouchableOpacity>
        )}

        {activeTab === 'selling' && item.status === 'confirmed' && (
          <TouchableOpacity
            style={styles.shipButton}
            onPress={() => updateOrderStatus(item.order_id, 'shipped')}
          >
            <Text style={styles.shipButtonText}>Mark as Shipped</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={25} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={{ width: 25 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'buying' && styles.activeTab]}
          onPress={() => setActiveTab('buying')}
        >
          <Text style={[styles.tabText, activeTab === 'buying' && styles.activeTabText]}>
            Buying
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'selling' && styles.activeTab]}
          onPress={() => setActiveTab('selling')}
        >
          <Text style={[styles.tabText, activeTab === 'selling' && styles.activeTabText]}>
            Selling
          </Text>
        </TouchableOpacity>
      </View>

      {/* Orders List */}
      {loading ? (
        <View style={styles.centered}>
          <Text>Loading orders...</Text>
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No orders found</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={(item) => item.order_id.toString()}
          contentContainerStyle={styles.ordersList}
        />
      )}
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
    padding: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  activeTab: {
    backgroundColor: '#F9C2D0',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#000',
    fontWeight: 'bold',
  },
  ordersList: {
    padding: 10,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  orderAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
  },
  userInfo: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  userLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 5,
  },
  userName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  address: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#007bff',
  },
  chatButtonText: {
    color: '#007bff',
    marginLeft: 5,
    fontSize: 14,
  },
  confirmButton: {
    backgroundColor: '#28a745',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  shipButton: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  shipButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default Orders;
