import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const EditProfile = ({navigation, route}) => {
const { user_id } = route.params || {}; // Get the user_id passed from LogIn

return (
<View style={styles.container}>
    {/* Header */}
    <View style={styles.header}>
        <Image source={require('../assets/logo.png')} style={{ width: 50, height: 50 }} />
    </View>
    <TouchableOpacity onPress={() => navigation.navigate('Profile', { user_id })}>
        <Text style={styles.backText}>Back</Text>
    </TouchableOpacity>

    {/* ProfilePic */}
    <View style={styles.profileInfoContainer}>
                <Image source={require('../assets/profilepic.png')}
                style={styles.profileImage} />
            <Text style={styles.editText}>Edit</Text>
    </View>

    {/* line between the profile info and post containers */}
    <View style={styles.line} />

    {/* Edit name */}
    <Text style={styles.label}>Name</Text>
    <View style={styles.inputContainer}>
        <TextInput style={styles.input} placeholder=" "/>
        </View>
    
    {/* Edit Username */}
    <Text style={styles.label}>Username</Text>
    <View style={styles.inputContainer}>
        <TextInput style={styles.input} placeholder=" "/>
        </View>
    {/* Edit Username */}
        <Text style={styles.label}>Bio</Text>
        <View style={styles.inputContainer}>
        <TextInput style={styles.input} placeholder=" "/>
        </View>

    {/* line */}
    <View style={styles.line} />

    {/* Edit Phone Number */}
    <Text style={styles.label}>Phone</Text>
    <View style={styles.inputContainer}>
        <TextInput style={styles.input} placeholder=" "/>
        </View>

    {/* Edit Email */}
    <Text style={styles.label}>Email</Text>
    <View style={styles.inputContainer}>
        <TextInput style={styles.input} placeholder=" "/>
        </View>   

    {/* Save button */}
    <TouchableOpacity style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save</Text>
    </TouchableOpacity>
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
    backText: {
        position: 'absolute',
        top: 20,
        left: 30,
        fontSize: 14,
        color: '#000',
        textDecorationLine: 'underline',
        fontWeight: 'bold',
    },
    profileInfoContainer:{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 50,
        paddingHorizontaL: 20,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    editText: {
        position: 'absolute',
        alignItems: 'center',
        bottom: 10,
        fontSize: 13,
        color: '#000',
        textDecorationLine: 'underline',
        fontWeight: 'bold',
    },
    line: {
        borderBottomWidth: 1,
        borderBottomColor: '#BBB7B7',
        marginTop: 20,
        width: '87%',
        alignSelf: 'center',
    },
    label: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#000',
        alignSelf: 'flex-start',
        marginLeft: 40,
        marginBottom: 10,
    },
    inputContainer:{
        alignItems:'center',
        width: '100%'

    },
    input:{
        width: '80%',
        height: 40,
        backgroundColor: 'white',
        borderRadius: 10,
        paddingHorizontal: 10,
        marginBottom: 15,
        borderWidth: 2,
        borderColor: 'black',
    },
    saveButton: {
        backgroundColor: '#FFDC9A',
        borderRadius: 30,
        paddingVertical: 10,
        paddingHorizontal: 35,
        marginTop: 10,
        borderWidth: 2, 
        alignSelf: 'center'
    },
    saveButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    }
});

export default EditProfile;