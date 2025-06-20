import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';


const GetStarted = ({ navigation }) => {
  return (
    <View style={styles.container}>
        {/*logo*/}
        <Image source={require("../assets/logo.png")}
        style={styles.logo} 
        />
        {/*first button*/}
        <TouchableOpacity style={[styles.button, styles.firstButton]}
        onPress={() => navigation.navigate('Register')}
        >
            <Text style={styles.firstButtonText}>Get Started</Text>
      </TouchableOpacity>

        {/*second button*/}
        <TouchableOpacity style={[styles.button, styles.secondButton]}
        onPress={() => navigation.navigate('LogIn')}
        >
            <Text style={styles.secondButtonText}>Sign in</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FBF7EA", 
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 215, 
    padding: 20,
},
  logo: {
    width: 319,
    height: 280,
    marginTop: 0,

},
  button: {
    marginTop: 20,
    borderRadius: 50, 
    paddingVertical: 10, 
    paddingHorizontal: 60, 
    borderWidth: 2, 
    alignItems: 'center', 
    justifyContent: 'center', 
    width: 250,
},
  firstButton: {
    backgroundColor: "#F9C2D0",
    borderColor: 'black',
    borderWidth: 2,
},
secondButton: {
    backgroundColor: 'white',
    borderColor: 'black',
    borderWidth: 2,
},
  firstButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
},
  secondButtonText: {
    color: "#F9C2D0",
    fontSize: 20,
    fontWeight: 'bold',
},
});

export default GetStarted;