import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';

// Replace the source below with your actual mascot image asset
const mascotImage = require("../assets/mascot.png"); // <-- update this path

const LandingPage = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Gradient-like background using a View with a fade effect */}
      <View style={styles.gradientBackground} />
      <View style={styles.content}>
        <Image source={mascotImage} style={styles.mascot} resizeMode="contain" />
        <Text style={styles.title}>
          The Crafty Start for Every{'\n'}
          <Text style={{ fontWeight: 'bold' }}>Iskolar’s Heart!</Text>
        </Text>
        <Text style={styles.subtitle}>
          Secure. Simple. Empowering students through smarter digital commerce.
        </Text>
        <TouchableOpacity 
            style={styles.button} 
            onPress={() => navigation.navigate('GetStarted')}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Get the device width for responsiveness
const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    zIndex: 0,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start', // Start from top, use marginTop to lower all content
    padding: 32,
    zIndex: 1,
    backgroundColor: 'rgba(255, 200, 220, 0.18)',
    borderRadius: 20,
    margin: 16,

  },
  mascot: {
    width: width * 0.55,
    height: width * 0.55,
    marginBottom: 32,
    marginTop: 180, // Add this to lower everything
  },
  title: {
    fontSize: 25,
    textAlign: 'center',
    color: '#222',
    marginBottom: 20, // Increase this to lower the subtitle
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    color: '#444',
    marginBottom: 70, // Increase this to lower the button
    paddingHorizontal: 12,
  },
  button: {
    backgroundColor: '#FFB6CE',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 32,
    alignSelf: 'stretch',
    marginHorizontal: 20,
    borderWidth: 1.2,
    borderColor: '#222',
    shadowColor: '#ffb6ce',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.24,
    shadowRadius: 14,
    elevation: 3,
    marginTop: 10, // Optionally increase to lower the button more
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 19,
    textAlign: 'center',
  },
});

export default LandingPage;