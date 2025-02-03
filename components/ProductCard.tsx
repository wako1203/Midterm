import { Product } from '@/types/type';
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';

interface ProductCardProps {
    product: Product;
    size?: 'small' | 'large'; 
    onPress?: (id: string) => void;
    onEdit?: (id: string) => void;
    onDelete?: (id: string, imageUrl: string) => void;
}

export const ProductCard = ({ 
    product, 
    size = 'small',
    onPress,
    onEdit,
    onDelete,
}: ProductCardProps) => {
    const cardStyle = size === 'small' ? styles.cardSmall : styles.cardLarge;
    const imageStyle = size === 'small' ? styles.productImageSmall : styles.productImageLarge;
    const handleLongPress = () => {
        Alert.alert(
            "Action", 
            "Chọn hành động", 
            [
                { text: "Chỉnh sửa", onPress: () => onEdit && onEdit(product.id) },
                { text: "Xoá", onPress: () => onDelete && onDelete(product.id, product.imageUrl) },
                { text: "Hủy", style: "cancel" }
            ]
        );
    };
    
    return (
        <TouchableOpacity style={[styles.card, cardStyle]} onLongPress={handleLongPress} activeOpacity={0.9}>
            
            <Image
                source={{ uri: product.imageUrl }} 
                style={[styles.productImage, imageStyle]}
            />
            <Text style={styles.productName}>{product.name}</Text>
            <View style={styles.footer}>
                <TouchableOpacity 
                    style={styles.button}
                    onPress={onPress ? () => onPress(product.id) : undefined}
                >
                    <Text style={styles.buttonText}>見る</Text>
                </TouchableOpacity>
                <Text style={styles.price}>¥{product.price}</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        margin: 8,
    },
    cardSmall: {
        width: 120,
    },
    cardLarge: {
        width: 170,
        padding: 8,
        borderWidth: 1,
        borderColor: '#eee',
    },
    productImage: {
        resizeMode: 'contain',
        marginBottom: 8,
        borderRadius: 8,
    },
    productImageSmall: {
        width: 80,
        height: 80,
    },
    productImageLarge: {
        width: '100%',
        aspectRatio: 1,
    },
    productName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    button: {
        backgroundColor: '#25523B',
        borderRadius: 12,
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    buttonText: {
        fontSize: 12,
        color: '#fff',
        fontWeight: 'bold',
    },
    price: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
});