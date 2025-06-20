import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, FlatList, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { URL } from '../config';

const Home = ({ route, navigation }) => {
  const { user_id } = route.params || {}; // Get the userId passed from LogIn

  const [posts, setPosts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const categories = ["Foods", "Supplies", "Gadgets", "Others"];

  // Fetch posts on component mount
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(`${URL}/api/get_items`); // Fetch all items
        setPosts(response.data); // Assume response contains all items
        setFilteredPosts(response.data); // Initialize filteredPosts with all posts
      } catch (err) {
        console.error('Error fetching posts:', err);
        if (err.response) {
          console.error('Response error:', err.response);
          Alert.alert('Error', 'Failed to fetch posts. Server responded with error.');
        } else if (err.request) {
          console.error('Request error:', err.request);
          Alert.alert('Error', 'Failed to fetch posts. No response from the server.');
        } else {
          console.error('General error:', err.message);
          Alert.alert('Error', 'An unknown error occurred while fetching posts.');
        }
      }
    };
    fetchPosts();
  }, []); // The effect will run once when the component is mounted

  // Handle category selection and filter posts
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    if (category) {
      setFilteredPosts(posts.filter(post => post.item_category === category));
    } else {
      setFilteredPosts(posts); // Show all posts if no category selected
    }
  };

  // Handle like functionality
  const handleLike = async (item_id, liked) => {
    if (!user_id) {
      Alert.alert('Error', 'Invalid user ID');
      return; // Prevent further execution if user_id is invalid
    }
  
    try {
      const endpoint = liked ? `${URL}/api/items/${item_id}/unlike` : `${URL}/api/items/${item_id}/like`;
      const response = await axios.post(endpoint, { user_id });
  
      if (response.status === 200) {
        setPosts((prevPosts) =>
          prevPosts.map(post =>
            post.item_id === item_id
              ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }
              : post
          )
        );
        setFilteredPosts((prevPosts) =>
          prevPosts.map(post =>
            post.item_id === item_id
              ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }
              : post
          )
        );
      } else {
        Alert.alert('Error', 'Failed to update like status');
      }
    } catch (err) {
      console.error('Error updating like status:', err);
      Alert.alert('Error', 'Something went wrong while updating like status');
    }
  };

  const imageMap = {
    1: require('../assets/items/1.jpg'),
    2: require('../assets/items/2.jpg'),
    3: require('../assets/items/3.jpg'),
    4: require('../assets/items/4.jpg'),
    5: require('../assets/items/5.jpg'),
  };

  // Category Images
  const categoryMap = {
    Foods: require('../assets/gadgetbutton/Foods.png'),
    Gadgets: require('../assets/gadgetbutton/Gadgets.png'),
    Supplies: require('../assets/gadgetbutton/Supplies.png'),
    Others: require('../assets/gadgetbutton/Other.png'),
  };

  // Render a single post item
  const renderItem = ({ item }) => (
    <View style={styles.postContainer}>
      <View style={styles.postHeader}>
        <Image source={imageMap[item.item_id]} style={styles.postImage} />
        <View style={styles.postInfo}>
          <Text style={styles.userName}>{`User ${item.item_user_id}`}</Text>
          <Text style={styles.date}>{item.date}</Text>
        </View>
      </View>
      <View style={styles.postDetails}>
        <Text style={styles.price}>₱{item.item_price}</Text>
        <Text style={styles.title}>{item.item_name}</Text>
        <View style={styles.iconsContainer}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => handleLike(item.item_id, item.liked)}
          >
            <Icon
              name={item.liked ? 'heart' : 'heart-outline'}
              size={25}
              color={item.liked ? '#F9C2D0' : '#000'}
            />
            <Text style={styles.iconText}>{item.likes}</Text>
          </TouchableOpacity>

          {/* Message Button */}
          <TouchableOpacity
            onPress={() => {
              if (!user_id || !item.item_user_id) {
                Alert.alert('Error', 'Invalid user ID');
                return;
              }

              // Debugging log to verify the ids being passed
              console.log('Current user ID:', user_id);
              console.log('Receiver ID:', item.item_user_id);

              if (user_id === item.item_user_id) {
                Alert.alert('Error', 'You cannot chat with yourself!');
                return;
              }

              navigation.navigate('ChatPage', {
                user_id: user_id, // Current user
                receiver_id: item.item_user_id, // User who posted the item
                userName: `${item.username}`, // Username for the chat header
                avatar: item.avatar, // Avatar for the chat page
              });
            }}
          >
            <Icon name="chatbubble-outline" size={24} color="#000" marginBottom="3" marginLeft="10"/>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../assets/logo.png')} style={{ width: 50, height: 50 }} />
      </View>

      <View style={styles.searchBarContainer}>
        <TextInput style={styles.searchBar} placeholder="Search" />
      </View>

      <Image source={require('../assets/7.png')} />

      {/* Corrected Category Buttons */}
      <View style={styles.categoryContainer}>
        {categories.map((category, index) => (
          <TouchableOpacity
            key={index}
            style={styles.categoryButton}
            onPress={() => handleCategorySelect(category)}
          >
            <Image source={categoryMap[category]} style={styles.categoryImage} />
            <Text style={styles.categoryText}>{category}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Pass `filteredPosts` instead of `posts` */}
      <FlatList
        data={filteredPosts} 
        renderItem={renderItem}
        keyExtractor={(item) => item.item_id.toString()}
        style={styles.postsList}
      />

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
  categoryImage: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  categoryButton: {
    backgroundColor: '#fff',
    padding: 10,
    height: '50',
    borderRadius: 100,
    width: '48%',
    borderWidth: 2,
    borderColor: '#000',
    flexDirection: 'row',
  },
  categoryText: {
    fontSize: 15,
    fontWeight: 'bold',
    paddingTop: 3,
    paddingLeft: '5',
    textAlign: 'center',
  },
  postsList: {
    flex: 1,
  },
  postContainer: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 20,
    padding: 10,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#000',
    overflow: 'hidden',
    marginBottom: 20,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  postImage: {
    height: 200,
    borderRadius: 10,
    width: '100%',
  },
  postInfo: {
    flex: 1,
    justifyContent: 'flex-start',
    marginLeft: 10,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  date: {
    color: '#aaa',
    fontSize: 12,
  },
  postDetails: {
    marginTop: 10,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 14,
    color: '#555',
  },
  iconsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',  
    alignItems: 'center',  
    position: 'absolute',  
    bottom: 1,  
    right: 1,   
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    gap: 10,
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  iconText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#555',
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

export default Home;