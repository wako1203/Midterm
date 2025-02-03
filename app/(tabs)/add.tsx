import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import * as ImagePicker from 'expo-image-picker';
import { Product } from '@/types/type';
import { ref as dbRef, ref, set } from 'firebase/database';
import { ref as storageRef, getDownloadURL, uploadBytes } from 'firebase/storage';
import { storage, database } from '../../firebase';
import { router } from "expo-router";

const AddProductScreen = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [imageUri, setImageUri] = useState<string | null>(null);

    const handleAddProduct = async () => {
        if (!name || !description || !price || !imageUri) {
            alert("Please fill all fields!");
            return;
        }

        const productId = uuidv4();
        const product: Product = {
            id: productId,
            name,
            description,
            price: parseFloat(price),
            imageUrl: '',
        };

        const response = await fetch(imageUri);
        const blob = await response.blob();
        const imageRef = storageRef(storage, `images/${productId}`);

        await uploadBytes(imageRef, blob);
        const imageUrl = await getDownloadURL(imageRef);

        const productRef = ref(database, 'products/' + productId);
        await set(productRef, {
            ...product,
            imageUrl,
        });

        alert("Product added successfully!");
        router.push('/home');
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setImageUri(result.assets[0].uri);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Add New Product</Text>

            <TextInput
                style={styles.input}
                placeholder="Product Name"
                value={name}
                onChangeText={setName}
            />
            <TextInput
                style={styles.input}
                placeholder="Description"
                value={description}
                onChangeText={setDescription}
            />
            <TextInput
                style={styles.input}
                placeholder="Price"
                value={price}
                keyboardType="numeric"
                onChangeText={setPrice}
            />

            <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
                {imageUri ? (
                    <Image source={{ uri: imageUri }} style={styles.image} />
                ) : (
                    <Text style={styles.imageText}>Choose an image</Text>
                )}
            </TouchableOpacity>

            <Button title="Add Product" onPress={handleAddProduct} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 10,
        paddingLeft: 10,
    },
    imagePicker: {
        marginBottom: 20,
        borderColor: '#ccc',
        borderWidth: 1,
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
    },
    imageText: {
        color: '#666',
    },
});

export default AddProductScreen;
