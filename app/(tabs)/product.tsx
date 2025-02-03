import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, Dimensions } from 'react-native';
import { router } from "expo-router";
import { ref as dbRef, get } from 'firebase/database';
import { storage, database } from '../../firebase';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSearchParams } from 'expo-router/build/hooks';
import Button from '@/components/Button';

const { width } = Dimensions.get('window');

interface SizeButtonProps {
    size: string;
    isSelected: boolean;
    onPress: () => void;
}

const SizeButton: React.FC<SizeButtonProps> = ({ size, isSelected, onPress }) => (
    <TouchableOpacity
        style={[styles.sizeButton, isSelected && styles.sizeButtonSelected]}
        onPress={onPress}
    >
        <Text style={[styles.sizeButtonText, isSelected && styles.sizeButtonTextSelected]}>
            {size}
        </Text>
    </TouchableOpacity>
);

export default function ProductDetailScreen() {
    const id = useSearchParams().get('id');
    console.log(id);
    const [product, setProduct] = useState<any | null>(null);
    const [selectedSize, setSelectedSize] = useState<string>(''); 
    const sizes = ["Sサイズ", "Mサイズ", "Lサイズ", "XLサイズ"];

    // Fetch product details from Firebase Realtime Database
    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                const productRef = dbRef(database, 'products/' + id);
                const snapshot = await get(productRef);

                if (snapshot.exists()) {
                    setProduct(snapshot.val());
                } else {
                    console.log("No product data available");
                }
            } catch (error) {
                console.error("Error fetching product details:", error);
            }
        };

        if (id) {
            fetchProductDetails();
        }
    }, [id]);

    const backButton = () => {
        router.push('/home');
    };

    if (!product) {
        return <Text>Loading product...</Text>; // Optional: Display loading message while fetching
    }

    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={backButton}>
                <Icon name="arrow-back" size={30} color="#9A9292" />
            </TouchableOpacity>
            <ScrollView>
                <Image
                    source={{ uri: product.imageUrl }} // Image URL from Firebase
                    style={styles.image}
                    resizeMode="cover"
                />

                {/* Product Details */}
                <View style={styles.detailsContainer}>
                    {/* Product Name and Price */}
                    <View style={styles.headerRow}>
                        <Text style={styles.productName}>{product.name}</Text>
                        <Text style={styles.price}>¥{product.price}</Text>
                    </View>

                    {/* Size Selection */}
                    <View style={styles.sizeContainer}>
                        <Text style={styles.sizeLabel}>サイズを選択してください</Text>
                        <View style={styles.sizeButtonsContainer}>
                            {sizes.map((size) => (
                                <SizeButton
                                    key={size}
                                    size={size}
                                    isSelected={selectedSize === size}
                                    onPress={() => setSelectedSize(size)}
                                />
                            ))}
                        </View>
                    </View>

                    {/* Description */}
                    <View style={styles.descriptionContainer}>
                        <Text style={styles.descriptionTitle}>説明</Text>
                        <Text style={styles.descriptionText}>
                            {product.description}
                        </Text>
                    </View>
                </View>

                {/* Buy Button */}
                <View style={styles.buyButtonContainer}>
                    <Button title="買う" onPress={() => { /* Handle buy button press */ }} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    backButton: {
        borderColor: '#9A9292',
        borderRadius: 50,
        height: 50,
        width: 50,
        borderWidth: 1,
        margin: 16,
        padding: 9,
        alignItems: 'center',
    },
    image: {
        width: width,
        height: width,
    },
    detailsContainer: {
        padding: 16,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    productName: {
        fontSize: 18,
        fontWeight: '500',
    },
    price: {
        fontSize: 18,
        fontWeight: '500',
    },
    sizeContainer: {
        marginBottom: 24,
    },
    sizeLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    sizeButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    sizeButton: {
        flex: 1,
        marginHorizontal: 4,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        alignItems: 'center',
    },
    sizeButtonSelected: {
        backgroundColor: '#1B4332',
        borderColor: '#1B4332',
    },
    sizeButtonText: {
        fontSize: 14,
        color: '#000',
    },
    sizeButtonTextSelected: {
        color: '#fff',
    },
    descriptionContainer: {
        marginBottom: 24,
    },
    descriptionTitle: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 8,
    },
    descriptionText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    buyButtonContainer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    buyButton: {
        backgroundColor: '#1B4332',
        paddingVertical: 16,
        borderRadius: 38,
        alignItems: 'center',
        marginBottom: 16,
    },
    buyButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
});
