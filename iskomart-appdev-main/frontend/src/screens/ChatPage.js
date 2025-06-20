import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Image, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { URL } from '../config';

const ChatPage = ({ navigation, route }) => {
  const { user_id, receiver_id, userName, avatar } = route.params || {}; // Fallback in case route.params is undefined
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch messages from the server whenever user_id or receiver_id changes
  useEffect(() => {
    if (!user_id || !receiver_id) return; // Exit if necessary params are missing
  
    const fetchMessages = async () => {
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
        const sortedMessages = filteredMessages.sort((a, b) => new Date(a.time) - new Date(b.time));
  
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
      text: inputText,
      time: new Date().toISOString(), // Store time in ISO format
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
  

  // Render a single message
  const renderMessage = ({ item }) => {    

    return (
      <View
        style={[
          styles.messageBubble,
          item.sender_id === user_id ? styles.myMessage : styles.otherMessage,
        ]}
      >
        <Text style={styles.messageText}>{item.text}</Text>
        <Text style={styles.messageTime}>{item.time}</Text>
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
});

export default ChatPage;
