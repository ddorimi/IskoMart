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
        const response = await axios.get(`${URL}/api/get_items?user_id=${user_id}`); // Pass user_id to check likes
        setPosts(response.data);
        setFilteredPosts(response.data);
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
  }, [user_id]);

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
   const handleAddToCart = async (item_id) => {
    if (!user_id) {
      Alert.alert('Error', 'Invalid user ID');
      return;
    }
    try {
      const response = await axios.post(`${URL}/api/cart/add`, {
        user_id,
        item_id,
      });
      if (response.status === 200) {
        Alert.alert('Success', 'Item added to cart!');
      } else {
        Alert.alert('Error', 'Failed to add item to cart');
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      Alert.alert('Error', 'Something went wrong while adding to cart');
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
  const renderItem = ({ item }) => {
    // Use database image if available, otherwise fallback to local images
    const imageSource = item.item_photo 
      ? { uri: item.item_photo }
      : imageMap[item.item_id] || require('../assets/items/1.jpg');

    return (
      <View style={styles.postContainer}>
        <View style={styles.postHeader}>
          <Image source={imageSource} style={styles.postImage} />
          <View style={styles.postInfo}>
            <Text style={styles.userName}>{item.username || `User ${item.item_user_id}`}</Text>
            <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
          </View>
        </View>
        <View style={styles.postDetails}>
          <Text style={styles.price}>₱{item.item_price}</Text>
          <Text style={styles.title}>{item.item_name}</Text>
          {item.item_description && (
            <Text style={styles.description}>{item.item_description}</Text>
          )}
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

                if (user_id === item.item_user_id) {
                  Alert.alert('Error', 'You cannot chat with yourself!');
                  return;
                }

                navigation.navigate('ChatPage', {
                  user_id: user_id,
                  receiver_id: item.item_user_id,
                  userName: item.username,
                  avatar: item.profile_image,
                });
              }}
            >
              <Icon name="chatbubble-outline" size={24} color="#000" marginBottom="3" marginLeft="10"/>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => handleAddToCart(item.item_id)}
            >
              <Icon name="cart-outline" size={24} color="#000" />
              <Text style={styles.iconText}>Add to Cart</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../assets/logo.png')} style={{ width: 50, height: 50 }} />
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor="#999"
        />
        <Icon name="search" size={20} color="#999" style={styles.searchIcon} />
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
    paddingHorizontal: 20,
    paddingVertical: 10,
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
  description: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
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