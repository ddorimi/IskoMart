import React, { useState } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { URL } from '../config'; // Assuming URL is defined in your config file

// Function for email validation
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const Register = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const handleRegister = async () => {
    // Ensure the required fields are filled
    if (!username || !email || !password) {
      Alert.alert('Error', 'Username, email, and password are required!');
      return;
    }
  
    // Email validation
    if (!isValidEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email!');
      return;
    }
  
    try {
      console.log('Sending registration data:', { username, first_name: firstName, last_name: lastName, email, password, phone, address });
      const response = await axios.post(`${URL}/register`, {
        username,
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        phone,
        address,
      });
  
      console.log('Response from server:', response); // Log the full response from the server
  
      if (response.status === 201) {
        Alert.alert('Success', 'Registration successful!');
        navigation.navigate('LogIn');
      } else {
        Alert.alert('Error', response.data.message || 'Something went wrong during registration');
      }
    } catch (err) {
      console.error('Error during registration:', err.response ? err.response.data : err);
      Alert.alert('Error', err.response?.data?.message || 'Something went wrong during registration');
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image source={require("../assets/logo.png")} style={styles.logo} />

      {/* Pink Section */}
      <View style={styles.registerContainer}>
        <Text style={styles.title}>Get started</Text>

        {/* Username */}
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your username"
          placeholderTextColor="#A9A9A9"
          value={username}
          onChangeText={setUsername}
        />

        {/* First Name */}
        <Text style={styles.label}>First Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your first name"
          placeholderTextColor="#A9A9A9"
          value={firstName}
          onChangeText={setFirstName}
        />

        {/* Last Name */}
        <Text style={styles.label}>Last Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your last name"
          placeholderTextColor="#A9A9A9"
          value={lastName}
          onChangeText={setLastName}
        />

        {/* Email */}
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor="#A9A9A9"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        {/* Password */}
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          placeholderTextColor="#A9A9A9"
          secureTextEntry={true}
          value={password}
          onChangeText={setPassword}
        />

        {/* Phone (Optional) */}
        <Text style={styles.label}>Phone (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your phone number"
          placeholderTextColor="#A9A9A9"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        {/* Address (Optional) */}
        <Text style={styles.label}>Address (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your address"
          placeholderTextColor="#A9A9A9"
          value={address}
          onChangeText={setAddress}
          multiline={true}
          numberOfLines={2}
        />

        {/* Sign In Link */}
        <Text style={styles.signInText}>
          Already have an account?{' '}
          <Text style={styles.signInLink} onPress={() => navigation.navigate('LogIn')}>Login</Text>
        </Text>

        {/* Register Button */}
        <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
          <Text style={styles.registerButtonText}>Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBF7EA',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  registerContainer: {
    width: '100%',
    backgroundColor: '#F9C2D0',
    padding: 20,
    borderTopLeftRadius: 75,
    borderTopRightRadius: 75,
    alignItems: 'center',
    paddingBottom: 60,
    paddingTop: 20,
    minHeight: 500,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  label: {
    marginLeft: 20,
    alignSelf: 'flex-start',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 10,
    color: 'white',
  },
  nameInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
  },
  input: {
    width: '90%',
    height: 40,
    borderWidth: 2,
    borderColor: 'black',
    borderRadius: 10,
    backgroundColor: 'white',
    paddingHorizontal: 10,
    marginTop: 5,
  },
  nameInput: {
    width: '48%',
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
  registerButton: {
    marginTop: 20,
    backgroundColor: '#FFDC9A',
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderColor: 'black',
    borderWidth: 2,
    alignItems: 'center',
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default Register;
