"use client"

import { useEffect, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  TextInput,
} from "react-native"
import { MaterialIcons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { ProductCard } from "@/components/ProductCard"
import { ref, onValue, remove } from "firebase/database"
import { auth, database, storage } from "@/firebase"
import type { Product } from "@/types/type"
import { router } from "expo-router"
import { ref as storageRef, deleteObject } from "firebase/storage"
import { GestureHandlerRootView } from "react-native-gesture-handler"

const { width } = Dimensions.get("window")

const HomeScreen = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const productsRef = ref(database, "products")
    onValue(productsRef, (snapshot) => {
      const data = snapshot.val()
      const productList: Product[] = data ? Object.values(data) : []
      setProducts(productList)
    })
  }, [])

  // Filter products based on search query
  const filteredProducts = products.filter((product) => product.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const onProductPress = (productId: string) => {
    router.push({
      pathname: "/product",
      params: { id: productId },
    })
  }

  const onAddProductPress = () => {
    router.push("/add")
  }

  const onDeleteProduct = async (productId: string, imageUrl: string) => {
    const productRef = ref(database, `/products/${productId}`)
    await remove(productRef)
    const imageRef = storageRef(storage, `images/${productId}`)
    await deleteObject(imageRef)
  }

  const onEditProduct = (productId: string) => {
    router.push({
      pathname: "/edit",
      params: { id: productId },
    })
  }

  const handleLogout = async () => {
    try {
      await auth.signOut()
      router.replace("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={["#2196F3", "#1976D2", "#0D47A1"]} style={styles.gradient}>
          <View style={styles.headerContainer}>
            <Text style={styles.header}>タカショー</Text>
            <View style={styles.subHeaderContainer}>
              <MaterialIcons name="store" size={20} color="rgba(255,255,255,0.8)" />
              <Text style={styles.subHeader}>Product Catalog</Text>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <MaterialIcons name="search" size={24} color="rgba(255,255,255,0.8)" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search products..."
                placeholderTextColor="rgba(255,255,255,0.6)"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery !== "" && (
                <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearButton}>
                  <MaterialIcons name="close" size={20} color="rgba(255,255,255,0.8)" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </LinearGradient>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
          <MaterialIcons name="logout" size={24} color="#fff" />
        </TouchableOpacity>

        <ScrollView style={styles.scrollView}>
          <View style={styles.grid}>
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                size="large"
                onPress={() => onProductPress(product.id)}
                onDelete={onDeleteProduct}
                onEdit={onEditProduct}
              />
            ))}
            {filteredProducts.length === 0 && searchQuery !== "" && (
              <View style={styles.noResultsContainer}>
                <MaterialIcons name="search-off" size={48} color="#999" />
                <Text style={styles.noResultsText}>No products found</Text>
              </View>
            )}
          </View>
        </ScrollView>

        <TouchableOpacity style={styles.fab} onPress={onAddProductPress} activeOpacity={0.7}>
          <MaterialIcons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </SafeAreaView>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  gradient: {
    paddingTop: 20,
    paddingBottom: 30,
  },
  headerContainer: {
    padding: 16,
  },
  header: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  subHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16, // Added margin to separate from search bar
  },
  subHeader: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
  },
  // New styles for search functionality
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 8,
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    marginLeft: 8,
    paddingVertical: 4,
  },
  clearButton: {
    padding: 4,
  },
  noResultsContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 16,
    color: "#999",
    marginTop: 12,
  },
  scrollView: {
    flex: 1,
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: "#f5f5f5",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 10,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2196F3",
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
  },
  logoutButton: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "#1976D2",
    borderRadius: 50,
    padding: 12,
    elevation: 5,
  },
})

export default HomeScreen

