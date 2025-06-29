import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Image, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { URL } from '../config';

const ChatPage = ({ navigation, route }) => {
  const { user_id, receiver_id, userName, avatar, orderContext, selectedItems } = route.params || {}; // Fallback in case route.params is undefined
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showOrderSummary, setShowOrderSummary] = useState(!!orderContext);
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  // Auto-populate message with order details if coming from cart
  useEffect(() => {
    if (orderContext && selectedItems && selectedItems.length > 0) {
      const orderSummary = `Hi! I'm interested in the following items:\n\n${selectedItems.map(item => 
        `• ${item.name} - ₱${item.price.toFixed(2)} (Qty: ${item.quantity})`
      ).join('\n')}\n\nTotal: ₱${selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}\n\nCan we discuss the details?`;
      
      setInputText(orderSummary);
    }
  }, [orderContext, selectedItems]);

  // Fetch messages from the server whenever user_id or receiver_id changes
  const fetchMessages = async () => {
    if (!user_id || !receiver_id) return; // Exit if necessary params are missing
  
    try {
      const response = await axios.get(`${URL}/text/messages/${user_id}`, {
        params: { receiver_id },
      });
      
      // Filter messages where sender and receiver match the user and receiver in either direction
      const filteredMessages = response.data.filter(
        (message) =>
          (message.sender_id === user_id && message.receiver_id === receiver_id) ||
          (message.sender_id === receiver_id && message.receiver_id === user_id)
      );

      // Sort messages by time before setting them in state
      const sortedMessages = filteredMessages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

      setMessages(sortedMessages);
      setLoading(false);
    } catch (error) {
      // To be modified for displaying a blank chat page with the linked user_id of the item clicked
      console.error('Error fetching messages:', error);
          if (error.response?.status === 404 || error.message === 'Network Error') {
              // If fetch fails but we don't want to show an error, just set an empty chat page
              setMessages([]);
              setLoading(false);
          } else {
              // In case of other errors, set the error state
              setError('Failed to fetch messages. Please try again.');
              setLoading(false);
          }
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [user_id, receiver_id]); // Re-fetch if user_id or receiver_id changes
  
  // Send a message
  const sendMessage = async () => {
    if (!inputText.trim()) {
      setError("Message cannot be empty");
      return;
    }
  
    const newMessage = {
      sender_id: user_id,
      receiver_id: receiver_id,
      text: inputText
    };
  
    try {
      const response = await axios.post(`${URL}/text/messages`, newMessage);
      if (response.status === 201) {
        // Add the new message to the bottom of the list
        setMessages((prevMessages) => [...prevMessages, response.data]);
        setInputText('');
        setError(null); // Reset error after a successful send
      } else {
        console.error('Error sending message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  

  // Confirm order function
  const confirmOrder = async () => {
    if (!selectedItems || selectedItems.length === 0) {
      alert('No items to confirm');
      return;
    }

    try {
      const orderData = {
        buyer_id: user_id,
        seller_id: receiver_id,
        total_amount: selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        items: selectedItems.map(item => ({
          item_id: item.id,
          quantity: item.quantity,
          price_at_time: item.price
        })),
        delivery_address: '', // Could add input for this
        notes: 'Order confirmed through chat'
      };

      const response = await axios.post(`${URL}/text/orders/confirm`, orderData);
      
      if (response.data.success) {
        setOrderConfirmed(true);
        setShowOrderSummary(false);
        alert('Order confirmed successfully!');
        
        // Refresh messages to show confirmation
        fetchMessages();
      }
    } catch (error) {
      console.error('Error confirming order:', error);
      alert('Failed to confirm order');
    }
  };

  // Render a single message
  const renderMessage = ({ item }) => {    

    return (
      <View
        style={[
          styles.messageBubble,
          item.sender_id === user_id ? styles.myMessage : styles.otherMessage,
        ]}
      >
        <Text style={styles.messageText}>{item.message_text}</Text>
        <Text style={styles.messageTime}>{new Date(item.created_at).toLocaleTimeString()}</Text>
      </View>
    );
  };

  // Render loading or error states
  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={25} color="#000" />
        </TouchableOpacity>

        <View style={styles.userInfo}>
          <Image
            source={{ uri: avatar || 'https://via.placeholder.com/40' }}
            style={styles.avatar}
          />
          <Text style={styles.userName}>{userName || 'Unknown'}</Text>
        </View>
      </View>

      {/* Order Summary Section */}
      {showOrderSummary && selectedItems && (
        <View style={styles.orderSummaryContainer}>
          <View style={styles.orderSummaryHeader}>
            <Text style={styles.orderSummaryTitle}>Items to Discuss:</Text>
            <TouchableOpacity 
              onPress={() => setShowOrderSummary(false)}
              style={styles.closeButton}
            >
              <Icon name="close" size={20} color="#666" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={selectedItems}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.orderItem}>
                <Text style={styles.orderItemName}>{item.name}</Text>
                <Text style={styles.orderItemPrice}>₱{item.price.toFixed(2)}</Text>
                <Text style={styles.orderItemQty}>Qty: {item.quantity}</Text>
              </View>
            )}
            keyExtractor={(item, index) => index.toString()}
          />
          <Text style={styles.orderTotal}>
            Total: ₱{selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
          </Text>
          
          {/* Confirm Order Button (only show if user is the buyer and talking to seller) */}
          <View style={styles.orderActionsContainer}>
            <TouchableOpacity 
              style={styles.confirmOrderButton}
              onPress={confirmOrder}
            >
              <Icon name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.confirmOrderText}>Confirm Order</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.message_id.toString()}
        contentContainerStyle={styles.messagesList}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Write a message..."
          value={inputText}
          onChangeText={setInputText}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Icon name="send" size={25} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Confirm Order Button - Shown only if there are selected items */}
      {selectedItems && selectedItems.length > 0 && !orderConfirmed && (
        <View style={styles.confirmOrderContainer}>
          <TouchableOpacity onPress={confirmOrder} style={styles.confirmOrderButton}>
            <Text style={styles.confirmOrderText}>Confirm Order</Text>
          </TouchableOpacity>
        </View>
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
    alignItems: 'center',
    backgroundColor: '#F9C2D0',
    padding: 10,
    borderBottomWidth: 2,
    borderColor: '#000',
  },
  backButton: {
    marginRight: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  messagesList: {
    flexGrow: 1,
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  messageBubble: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    maxWidth: '75%',
  },
  myMessage: {
    backgroundColor: '#DCF8C6',
    alignSelf: 'flex-end',
  },
  otherMessage: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
  },
  messageTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 2,
    borderColor: '#000',
  },
  input: {
    flex: 1,
    padding: 10,
    borderWidth: 2,
    borderRadius: 20,
    borderColor: '#000',
    marginRight: 10,
  },
  sendButton: {
    padding: 10,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
    color: '#aaa',
  },
  errorText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
    color: 'red',
  },
  orderSummaryContainer: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F9C2D0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderSummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderSummaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  orderItem: {
    backgroundColor: '#F9C2D0',
    padding: 10,
    marginRight: 10,
    borderRadius: 8,
    minWidth: 120,
  },
  orderItemName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  orderItemPrice: {
    fontSize: 13,
    color: '#666',
  },
  orderItemQty: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
    marginTop: 10,
    color: '#333',
  },
  orderActionsContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  confirmOrderButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  confirmOrderText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default ChatPage;
