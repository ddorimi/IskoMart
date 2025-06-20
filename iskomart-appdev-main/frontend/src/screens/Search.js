import React from 'react';
import { StyleSheet, Text, View, TextInput, Image, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; 

const Search = ({ navigation, route }) => {
  const { user_id } = route.params;
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={require('../assets/logo.png')} style={{ width: 50, height: 50 }} />
      </View>

      {/* Scrollable Content */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Search Bar */}
        <View style={styles.searchBarContainer}>
          <TextInput style={styles.searchBar} placeholder="Search" />
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.navigate('Home', { user_id })}>
          <Icon name="home-outline" size={25} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Search', { user_id })}>
          <Icon name="search-outline" size={25} color="#000" />
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
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9C2D0',
  },
  searchBarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    backgroundColor: '#fff',
    borderRadius: 120,
    paddingHorizontal: 10,
    height: 40,
    width: '90%',
    marginTop: 10,
    borderWidth: 2,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
  },
  scrollContainer: {
    paddingBottom: 80, 
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
    zIndex: 1,
  },
});

export default Search;