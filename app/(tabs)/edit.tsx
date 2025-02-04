import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  Image, 
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Product } from '@/types/type';
import { ref as dbRef, set, get } from 'firebase/database';
import { ref as storageRef, getDownloadURL, uploadBytes } from 'firebase/storage';
import { storage, database } from '../../firebase';
import { router, useLocalSearchParams } from "expo-router";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSearchParams } from 'expo-router/build/hooks';

const { width } = Dimensions.get('window');

const EditProductScreen = () => {
    const id = useSearchParams().get('id');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        const loadProduct = async () => {
            try {
                const productRef = dbRef(database, 'products/' + id);
                const snapshot = await get(productRef);
                if (snapshot.exists()) {
                    const product = snapshot.val();
                    setName(product.name);
                    setDescription(product.description);
                    setPrice(product.price.toString());
                    setImageUri(product.imageUrl);
                }
            } catch (error) {
                console.error('Error loading product:', error);
                alert('Error loading product details');
            } finally {
                setInitialLoading(false);
            }
        };

        loadProduct();
    }, [id]);

    const handleUpdateProduct = async () => {
        try {
            if (!name || !description || !price || !imageUri) {
                alert("Please fill all fields!");
                return;
            }

            setLoading(true);
            const product: Product = {
                id: id as string,
                name,
                description,
                price: parseFloat(price),
                imageUrl: imageUri,
            };

            // Only upload new image if it's changed (doesn't start with 'https://')
            if (!imageUri.startsWith('https://')) {
                const response = await fetch(imageUri);
                const blob = await response.blob();
                const imageRef = storageRef(storage, `images/${id}`);

                await uploadBytes(imageRef, blob);
                const imageUrl = await getDownloadURL(imageRef);
                product.imageUrl = imageUrl;
            }

            const productRef = dbRef(database, 'products/' + id);
            await set(productRef, product);

            alert("Product updated successfully!");
            router.push('/home');
        } catch (error) {
            console.error('Error updating product:', error);
            alert('Error updating product. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('Permission to access media library is required!');
            return;
        }
    
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

    const handleCancel = () => {
        router.push('/home');
    };

    if (initialLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.headerContainer}>
                    <Text style={styles.header}>Edit Product</Text>
                    <Text style={styles.subHeader}>Update product details below</Text>
                </View>

                <TouchableOpacity 
                    onPress={pickImage} 
                    style={styles.imagePicker}
                    activeOpacity={0.7}
                >
                    {imageUri ? (
                        <Image source={{ uri: imageUri }} style={styles.image} />
                    ) : (
                        <View style={styles.imagePickerContent}>
                            <MaterialCommunityIcons name="image-plus" size={40} color="#666" />
                            <Text style={styles.imageText}>Change Product Image</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <View style={styles.formContainer}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Product Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter product name"
                            value={name}
                            onChangeText={setName}
                            placeholderTextColor="#999"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Enter product description"
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={4}
                            placeholderTextColor="#999"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Price</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter price"
                            value={price}
                            keyboardType="numeric"
                            onChangeText={setPrice}
                            placeholderTextColor="#999"
                        />
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity 
                            style={[styles.button, styles.cancelButton]}
                            onPress={handleCancel}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.button, styles.updateButton]}
                            onPress={handleUpdateProduct}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Update Product</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    scrollContent: {
        flexGrow: 1,
        padding: 20,
    },
    headerContainer: {
        marginBottom: 24,
        alignItems: 'center',
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    subHeader: {
        fontSize: 16,
        color: '#666',
    },
    formContainer: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        backgroundColor: '#fff',
        color: '#333',
    },
    textArea: {
        height: 120,
        paddingTop: 12,
        paddingBottom: 12,
        textAlignVertical: 'top',
    },
    imagePicker: {
        marginBottom: 24,
        borderRadius: 16,
        overflow: 'hidden',
        height: 200,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderStyle: 'dashed',
    },
    imagePickerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    imageText: {
        color: '#666',
        fontSize: 16,
        marginTop: 8,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 10,
    },
    button: {
        flex: 1,
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    updateButton: {
        backgroundColor: '#007AFF',
    },
    cancelButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#007AFF',
    },
    buttonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },
    cancelButtonText: {
        color: '#007AFF',
    },
});

export default EditProductScreen;