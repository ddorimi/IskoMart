import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, Alert } from 'react-native';
import axios from 'axios';
import { URL } from '../config';

const LogIn = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Username and password are required!');
      return;
    }
  
    try {
      console.log('Sending login data:', { username, password });
      const response = await axios.post(`${URL}/login`, { username, password });
  
      console.log('Response from server:', response); // Log the full response from the server
  
      if (response.status === 200) {
        console.log('User ID:', response.data.userData.user_id); // Log the user_id
        Alert.alert('Success', 'Login successful');
        navigation.navigate('Home', { user_id: response.data.userData.user_id });
      } else {
        Alert.alert('Error', response.data.message || 'Something went wrong during login');
      }
    } catch (err) {
      console.error('Error during login:', err.response ? err.response.data : err);
      Alert.alert('Error', err.response?.data?.message || 'Something went wrong. Please try again later');
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image source={require("../assets/logo.png")} style={styles.logo} />

      {/* Login Form */}
      <View style={styles.loginContainer}>
        <Text style={styles.title}>Sign in</Text>

        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your username"
          value={username}
          onChangeText={setUsername}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.signInButton} onPress={handleLogin}>
          <Text style={styles.signInButtonText}>Sign in</Text>
        </TouchableOpacity>

        {/* Sign In Link */}
        <Text style={styles.signInText}>
          Don't have an account?{' '} 
          <Text style={styles.signInLink} onPress={() => navigation.navigate('Register')}>Sign Up</Text>
        </Text>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FBF7EA",
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  logo: {
    width: 319,
    height: 280,
    position: 'absolute',
    top: 100,
  },
  loginContainer: {
    width: '100%',
    backgroundColor: "#F9C2D0",
    padding: 20,
    borderTopLeftRadius: 70,
    borderTopRightRadius: 70,
    alignItems: 'center',
    paddingBottom: 115,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    alignSelf: 'flex-start',
    marginLeft: 40,
    marginBottom: 10,
  },
  input: {
    width: '80%',
    height: 40,
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: 'black',
  },
  signInButton: {
    backgroundColor: '#FFDC9A',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 30,
    marginTop: 10,
    borderWidth: 2,
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  signInText: {
    marginTop: 10,
    fontSize: 14,
    color: 'white',
  },
  signInLink: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

export default LogIn;
