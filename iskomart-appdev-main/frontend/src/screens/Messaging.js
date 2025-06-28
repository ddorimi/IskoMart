import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { URL } from '../config';
import { Image } from 'react-native';


const Messaging = ({ navigation, route }) => {
  const { user_id } = route.params; // Get the user_id passed from Home
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState({}); // Store user data for chat partners
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [noMessages, setNoMessages] = useState(false); // New state for empty messages

  // Fetch messages from the server
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`${URL}/text/messages/${user_id}`);
  
        if (response.data.length === 0) {
          setNoMessages(true);  // No messages found
        } else {
          setMessages(response.data);
          setNoMessages(false); // Messages exist, hide the noMessages state
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        if (error.response?.status === 404) {
          setNoMessages(true); // No messages found
        } else {
          setError('Failed to load messages');
        }
      } finally {
        setLoading(false);
      }
    };
  
    fetchMessages();
  }, [user_id]);

  // Group messages by conversation partner and get the latest message for each
  const latestMessages = Object.values(
    messages.reduce((acc, message) => {
      const partnerId = message.sender_id === user_id ? message.receiver_id : message.sender_id;

      if (!acc[partnerId] || new Date(acc[partnerId].created_at) < new Date(message.created_at)) {
        acc[partnerId] = message;
      }

      return acc;
    }, {})
  );

  // Fetch user data for a specific user_id
  const fetchUserById = async (user_id) => {
    try {
      const response = await axios.get(`${URL}/text/messages/user/${user_id}`);
      return response.data; // Returns { username, avatar }
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  };

  // Fetch user data for all chat partners
  useEffect(() => {
    const fetchUsers = async () => {
      const usersData = {};
      for (const message of latestMessages) {
        const partnerId = message.sender_id === user_id ? message.receiver_id : message.sender_id;
        if (!usersData[partnerId]) {
          usersData[partnerId] = await fetchUserById(partnerId);
        }
      }
      setUsers(usersData);
    };

    if (latestMessages.length > 0) {
      fetchUsers();
    }
  }, [latestMessages, user_id]);

  // Render the latest message for each receiver
  const renderMessage = ({ item }) => {
    const isSender = item.sender_id === user_id;
    const chatPartnerId = isSender ? item.receiver_id : item.sender_id;
    const chatPartner = users[chatPartnerId] || { username: 'Unknown' };

    return (
      <TouchableOpacity
        key={item.message_id}
        style={styles.messageContainer}
        onPress={() => {
          navigation.navigate('ChatPage', {
            userName: chatPartner.username,
            item_id: item.item_id,
            user_id: user_id, // Current user
            receiver_id: chatPartnerId, // Pass the receiver_id
          });
        }}
      >
        {/* Avatar removed */}
        <View style={styles.messageInfo}>
          <Text style={styles.userName}>{chatPartner.username}</Text>
          <Text style={styles.lastMessage}>{item.message_text}</Text>
        </View>
        <Text style={styles.time}>{new Date(item.created_at).toLocaleTimeString()}</Text>
      </TouchableOpacity>
    );
  };

  // Render loading or error messages
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
        <Image source={require('../assets/logo.png')} style={{ width: 50, height: 50 }} />
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Messages"
          placeholderTextColor="#999"
        />
        <Icon name="search" size={20} color="#999" style={styles.searchIcon} />
      </View>
      
      {loading && <Text>Loading messages...</Text>}
      {!loading && noMessages ? (
        <View style={styles.centeredContainer}>
          <Text style={styles.noMessagesText}>There are no messages to display.</Text>
        </View>
      ) : (
        <FlatList
        data={latestMessages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.message_id.toString()}
        style={styles.messagesList}
        />
      )}

      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.navigate('Home', { user_id })}>
          <Icon name="home-outline" size={25} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('AddToCart', { user_id })}>
          <Icon name="cart-outline" size={25} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('AddPost', { user_id })}>
          <Icon name="add-circle-outline" size={25} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Messaging', { user_id })}>
          <Icon name="mail-outline" size={25} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Profile', { user_id })}>
          <Icon name="person-outline" size={25} color="#000" />
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
    padding: 10,
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
  messagesList: {
    flex: 1,
    paddingHorizontal: 10,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    elevation: 2,
    borderWidth: 2,
    borderColor: '#000',
  },
  messageInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  lastMessage: {
    fontSize: 14,
    color: '#555',
  },
  time: {
    fontSize: 12,
    color: '#aaa',
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
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noMessagesText: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
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

export default Messaging;
