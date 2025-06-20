import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { URL } from '../config'; // Import URL from config

const Profile = ({ route, navigation }) => {
    const { user_id } = route.params || {}; // Get the userId passed from LogIn
    const [user, setUser] = useState(null);  // State to store user details
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const fetchUserData = async () => {
            if (user_id) {
                try {
                    const response = await axios.get(`${URL}/users/${user_id}`);
                    console.log('User Data Response:', response.data); // Debugging
                    setUser(response.data.userInfo); // Access the nested userInfo object
                } catch (err) {
                    console.error('Error fetching user data:', err);
                    Alert.alert('Error', 'Failed to fetch user data.');
                }
            } else {
                Alert.alert('Error', 'User ID is not available');
            }
        };

        const fetchPosts = async () => {
            if (user_id) {
                try {
                    const response = await axios.get(`${URL}/api/items/${user_id}`);
                    setPosts(response.data); 
                } catch (err) {
                    console.error('Error fetching posts:', err);
                    Alert.alert('Error', 'Failed to fetch posts.');
                }
            }
        };

        fetchUserData();
        fetchPosts();
    }, [user_id]);  // Run on user_id change

    const imageMap = {
        1: require('../assets/items/1.jpg'),
        2: require('../assets/items/2.jpg'),
        3: require('../assets/items/3.jpg'),
        4: require('../assets/items/4.jpg'),
        5: require('../assets/items/5.jpg'),
      };

    const renderItem = ({ item }) => (
        <View style={styles.postContainer}>
            <View style={styles.postHeader}>
                <Image source={imageMap[item.item_id]} style={styles.postImage} />
                <View style={styles.postInfo}>
                    <Text style={styles.userName}>{`User ${item.user_id}`}</Text>
                    <Text style={styles.date}>{item.date}</Text>
                </View>
            </View>
            <View style={styles.postDetails}>
                <Text style={styles.price}>₱{item.item_price}</Text>
                <Text style={styles.title}>{item.item_name}</Text>
                <View style={styles.iconsContainer}>
                    <TouchableOpacity
                        style={styles.iconButton}
                    >
                        <Icon
                            name={item.liked ? 'heart' : 'heart-outline'}
                            size={24}
                            color={item.liked ? '#F9C2D0' : '#000'}
                        />
                        <Text style={styles.iconText}>{item.likes}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            const user = findUserById(item.user_id);
                            navigation.navigate('ChatPage', {
                                receiver_id: item.user_id,
                                user_id: user_id,
                            });
                        }}
                    >
                        <Icon name="chatbubble-outline" size={25} color="#000" marginBottom="3"/>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Image source={require('../assets/logo.png')} style={styles.logo} />
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('LogIn')}>
                <Text style={styles.logOutText}>Log Out</Text>
            </TouchableOpacity>

            {user ? (
                <View style={styles.profileInfoContainer}>
                    <Image source={require('../assets/profilepic.png')} style={styles.profileImage} />
                    <View style={styles.profileInfo}>
                        <Text style={styles.userName}>{user.first_name || 'User'} {user.last_name || ''}</Text>
                        <Text style={styles.university}>{user.email || 'No email provided'}</Text>
                        <TouchableOpacity>
                            <Text style={styles.editProfile} onPress={() => navigation.navigate('EditProfile', { user_id })}>
                                Edit Profile
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <Text>Loading profile...</Text>
            )}

            <View style={styles.line} />

            <FlatList
                data={posts}
                renderItem={renderItem}
                keyExtractor={(item) => item.item_id.toString()}
                numColumns={2}
                columnWrapperStyle={styles.feedRow}
                contentContainerStyle={styles.feedContainer}
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
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    logo: {
        width: 50,
        height: 50,
    },
    profileInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        paddingHorizontal: 20,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginRight: 20,
    },
    profileInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    logOutText: {
        position: 'absolute',
        top: 20,
        right: 20,
        fontSize: 14,
        color: '#000',
        textDecorationLine: 'underline',
        fontWeight: 'bold',
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    university: {
        fontSize: 14,
        color: '#555',
        marginBottom: 10,
    },
    editProfile: {
        fontSize: 12,
        color: '#BBB7B7',
        textDecorationLine: 'underline',
    },
    line: {
        borderBottomWidth: 1,
        borderBottomColor: '#BBB7B7',
        marginTop: 20,
        width: '87%',
        alignSelf: 'center',
    },
    feedContainer: {
        padding: 10,
    },
    feedRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    postContainer: {
        width: '48%',
        marginBottom: 10,
        borderRadius: 20,
        backgroundColor: '#fff',
        elevation: 5,
        borderWidth: 2,
        padding: 10,
        position: 'relative',
        overflow: 'hidden',
    },
    postHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    postImage: {
        width: '100%',
        height: 150,
        borderRadius: 10,
    },
    postInfo: {
        marginLeft: 10,
    },
    postDetails: {
        marginTop: 10,
        padding: 5,
    },
    price: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000',
    },
    title: {
        fontSize: 12,
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
    iconButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10,
    },
    iconText: {
        marginLeft: 5,
    },
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 15,
        backgroundColor: '#FFDC9A',
        borderRadius: 30,
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

export default Profile;