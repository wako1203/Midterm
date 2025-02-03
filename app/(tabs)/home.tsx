import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { ProductCard } from '@/components/ProductCard';
import { ref, onValue } from 'firebase/database';
import { database } from '@/firebase';
import { Product } from '@/types/type';
import Button from '@/components/Button';
import { router } from "expo-router";

const HomeScreen = () => {
    
    const [products, setProducts] = useState<Product[]>([]);
    useEffect(() => {
        const productsRef = ref(database, 'products'); 
        onValue(productsRef, (snapshot) => {
            const data = snapshot.val();
            const productList: Product[] = data ? Object.values(data) : [];
            setProducts(productList); 
        });
    }, []);

    const onProductPress = (productId: string) => {
        console.log('Product ID:', productId);
    };
    const onAddProductPress = () => {
        router.push('/add');
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <Text style={styles.header}>タカショー</Text>

                <View style={styles.grid}>
                    {products.map((product) => (
                        <ProductCard 
                            key={product.id} 
                            product={product} 
                            size="large" 
                            onPress={() => onProductPress(product.id)} 
                        />
                    ))}
                </View>
            </ScrollView>
            <View style={styles.buyButtonContainer}>
                    <Button
                        title="Add Product"
                        onPress={() => onAddProductPress()}
                    />
                </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        padding: 16,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 8,
    },
    buyButtonContainer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
});

export default HomeScreen;
