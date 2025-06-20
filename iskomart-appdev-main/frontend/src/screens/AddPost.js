import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Image, TouchableOpacity, ScrollView, Modal, FlatList, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { URL } from '../config';

const AddPost = ({ navigation, route }) => {
  const { user_id } = route.params;

  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [imageUris, setImageUris] = useState([]);

  const categories = [
    { id: '1', label: 'Foods' },
    { id: '2', label: 'Supplies' },
    { id: '3', label: 'Gadgets' },
    { id: '4', label: 'Others' },
  ];

  const handleCategorySelect = (category) => {
    setCategory(category);
    setIsModalVisible(false);
  };

  const handleAddPhoto = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert('Permission to access media library is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setImageUris((prevUris) => [...prevUris, result.uri]);
    }
  };

  const handlePublish = async () => {
    if (!price || !description || !category) {
      Alert.alert('Error', 'All fields are required!');
      return;
    }
  
    try {
      const response = await axios.post(`${URL}/api/items`, {
        item_photo: imageUris[0] || null,
        item_name: description,
        item_price: price,
        item_description: description,
        item_category: category,
        user_id: user_id,
      });
  
      if (response.status === 201) {
        Alert.alert('Success', 'Item published successfully!');
        navigation.navigate('Home', { user_id });
      } else {
        Alert.alert('Error', response.data.message || 'Something went wrong while publishing the item');
      }
    } catch (err) {
      console.error('Error publishing item:', err.response ? err.response.data : err);
      Alert.alert('Error', err.response?.data?.message || 'Something went wrong while publishing the item');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../assets/logo.png')} style={{ width: 50, height: 50 }} />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cancelButton}>
          <Text style={styles.CancelbuttonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handlePublish} style={styles.publishButton}>
          <Text style={styles.PublishbuttonText}>Publish</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.scrollContainer}>
        <View style={styles.addImageContainer}>
          <TouchableOpacity onPress={handleAddPhoto} style={styles.addImageButton}>
            <Image source={require('../assets/gadgetbutton/addphoto.png')} style={styles.addImageIcon} />
          </TouchableOpacity>
          <Text style={styles.addImageText}>Add Photo</Text>
        </View>

        {imageUris.length > 0 && (
          <ScrollView horizontal style={styles.imagePreviewContainer}>
            {imageUris.map((uri, index) => (
              <Image key={index} source={{ uri }} style={styles.selectedImage} />
            ))}
          </ScrollView>
        )}

        <Text style={styles.label}>Price</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter price"
          value={price ? `₱${price}` : ''}
          onChangeText={(text) => {
            const numericText = text.replace(/[^0-9]/g, '');
            setPrice(numericText);
          }}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Enter description"
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
        />

        <Text style={styles.label}>Listing Options</Text>
        <TouchableOpacity onPress={() => setIsModalVisible(true)} style={styles.dropdown}>
          <Text style={styles.dropdownText}>{category ? category : 'Select Category'}</Text>
        </TouchableOpacity>

        <Modal
          transparent={true}
          visible={isModalVisible}
          animationType="slide"
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <FlatList
                data={categories}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => handleCategorySelect(item.label)} style={styles.modalItem}>
                    <Text style={styles.modalItemText}>{item.label}</Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.id}
              />
            </View>
          </View>
        </Modal>
      </View>

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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9C2D0',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 10,
    marginVertical: 20,
    height: 40,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  publishButton: {
    backgroundColor: '#FFDC9A',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#000',
  },
  CancelbuttonText: {
    color: '#8F8C8C',
    fontSize: 16,
    fontWeight: 'bold',
  },
  PublishbuttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#000',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  scrollContainer: {
    paddingBottom: 80,
    paddingHorizontal: 20,
  },
  dropdown: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#000',
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    borderWidth: 2,
    borderColor: '#000',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  modalItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  modalItemText: {
    fontSize: 16,
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
  addImageContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  addImageButton: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#000',
    marginBottom: 10,
  },
  addImageText: {
    fontSize: 16,
    color: '#333',
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  selectedImage: {
    width: 100,
    height: 100,
    marginRight: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
  },
});

export default AddPost;
