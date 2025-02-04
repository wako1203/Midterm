import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  SafeAreaView, 
  Dimensions,
  ActivityIndicator,
  Share,
  Animated,
  Button
} from 'react-native';
import { router } from "expo-router";
import { ref as dbRef, get } from 'firebase/database';
import { storage, database } from '../../firebase';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSearchParams } from 'expo-router/build/hooks';


const { width } = Dimensions.get('window');

interface SizeButtonProps {
    size: string;
    isSelected: boolean;
    onPress: () => void;
}

interface ColorButtonProps {
    color: string;
    isSelected: boolean;
    onPress: () => void;
}

const ColorButton: React.FC<ColorButtonProps> = ({ color, isSelected, onPress }) => (
    <TouchableOpacity
        style={[
            styles.colorButton,
            { backgroundColor: color },
            isSelected && styles.colorButtonSelected
        ]}
        onPress={onPress}
    >
        {isSelected && (
            <Icon name="check" size={16} color="#fff" />
        )}
    </TouchableOpacity>
);

const SizeButton: React.FC<SizeButtonProps> = ({ size, isSelected, onPress }) => {
    const scaleValue = React.useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleValue, {
            toValue: 0.95,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleValue, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    return (
        <TouchableOpacity
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Animated.View
                style={[
                    styles.sizeButton,
                    isSelected && styles.sizeButtonSelected,
                    { transform: [{ scale: scaleValue }] }
                ]}
            >
                <Text style={[styles.sizeButtonText, isSelected && styles.sizeButtonTextSelected]}>
                    {size}
                </Text>
            </Animated.View>
        </TouchableOpacity>
    );
};

export default function ProductDetailScreen() {
    const id = useSearchParams().get('id');
    const [product, setProduct] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [selectedColor, setSelectedColor] = useState<string>('');
    const [imageScale] = useState(new Animated.Value(1));
    
    const sizes = ["Size S", "Size M", "Size L", "Size XL"];
    const colors = ["#000000", "#4A5568", "#2B6CB0", "#2F855A", "#C53030"];

    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                setLoading(true);
                setError(null);
                const productRef = dbRef(database, 'products/' + id);
                const snapshot = await get(productRef);

                if (snapshot.exists()) {
                    setProduct(snapshot.val());
                } else {
                    setError("Product not found");
                }
            } catch (error) {
                setError("Error loading product");
                console.error("Error fetching product details:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProductDetails();
        }
    }, [id]);

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out ${product.name} - ¥${product.price}`,
                url: product.imageUrl,
            });
        } catch (error) {
            console.error("Error sharing product:", error);
        }
    };

    const handleImagePress = () => {
        Animated.sequence([
            Animated.spring(imageScale, {
                toValue: 1.05,
                useNativeDriver: true,
            }),
            Animated.spring(imageScale, {
                toValue: 1,
                useNativeDriver: true,
            }),
        ]).start();
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1B4332" />
                <Text style={styles.loadingText}>Loading product details...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Icon name="error-outline" size={48} color="#C53030" />
                <Text style={styles.errorText}>{error}</Text>
                <Button title="Go Back" onPress={() => router.push('/home')} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.push('/home')}>
                    <Icon name="arrow-back" size={24} color="#9A9292" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                    <Icon name="share" size={24} color="#9A9292" />
                </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
                <TouchableOpacity activeOpacity={0.9} onPress={handleImagePress}>
                    <Animated.View style={{ transform: [{ scale: imageScale }] }}>
                        <Image
                            source={{ uri: product.imageUrl }}
                            style={styles.image}
                            resizeMode="cover"
                        />
                    </Animated.View>
                </TouchableOpacity>

                <View style={styles.detailsContainer}>
                    <View style={styles.headerRow}>
                        <Text style={styles.productName}>{product.name}</Text>
                        <Text style={styles.price}>¥{product.price.toLocaleString()}</Text>
                    </View>

                    <View style={styles.colorContainer}>
                        <Text style={styles.sectionLabel}>Color</Text>
                        <View style={styles.colorButtonsContainer}>
                            {colors.map((color) => (
                                <ColorButton
                                    key={color}
                                    color={color}
                                    isSelected={selectedColor === color}
                                    onPress={() => setSelectedColor(color)}
                                />
                            ))}
                        </View>
                    </View>

                    <View style={styles.sizeContainer}>
                        <Text style={styles.sectionLabel}>Select Size</Text>
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

                    <View style={styles.descriptionContainer}>
                        <Text style={styles.sectionLabel}>Description</Text>
                        <Text style={styles.descriptionText}>
                            {product.description}
                        </Text>
                    </View>
                </View>

                <View style={styles.buyButtonContainer}>
                    <Button 
                        title={`Buy for ¥${product.price.toLocaleString()}`}
                        onPress={() => {/* Handle buy */}}
                        disabled={!selectedSize || !selectedColor}
                    />
                    {(!selectedSize || !selectedColor) && (
                        <Text style={styles.selectionRequired}>
                            Please select size and color
                        </Text>
                    )}
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    backButton: {
        borderColor: '#9A9292',
        borderRadius: 25,
        height: 40,
        width: 40,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    shareButton: {
        borderColor: '#9A9292',
        borderRadius: 25,
        height: 40,
        width: 40,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    errorText: {
        marginVertical: 16,
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    image: {
        width: width,
        height: width * 1.2,
        backgroundColor: '#f5f5f5',
    },
    detailsContainer: {
        padding: 20,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    productName: {
        fontSize: 24,
        fontWeight: '600',
        flex: 1,
        marginRight: 16,
    },
    price: {
        fontSize: 24,
        fontWeight: '600',
        color: '#1B4332',
    },
    sectionLabel: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 12,
        color: '#4A5568',
    },
    colorContainer: {
        marginBottom: 24,
    },
    colorButtonsContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    colorButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    colorButtonSelected: {
        borderColor: '#1B4332',
    },
    sizeContainer: {
        marginBottom: 24,
    },
    sizeButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    sizeButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        alignItems: 'center',
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    sizeButtonSelected: {
        backgroundColor: '#1B4332',
        borderColor: '#1B4332',
    },
    sizeButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#4A5568',
    },
    sizeButtonTextSelected: {
        color: '#fff',
    },
    descriptionContainer: {
        marginBottom: 24,
    },
    descriptionText: {
        fontSize: 15,
        color: '#4A5568',
        lineHeight: 24,
    },
    buyButtonContainer: {
        borderRadius: 12,
        padding: 20,
        paddingTop: 0,
    },
    selectionRequired: {
        textAlign: 'center',
        color: '#C53030',
        marginTop: 8,
        fontSize: 14,
    },
});