"use client"

import type { Product } from "@/types/type"
import React, { useState } from "react"
import { View, Text, Image, TouchableOpacity, StyleSheet, Pressable, Modal, Animated } from "react-native"
import { MaterialIcons } from "@expo/vector-icons"

interface ProductCardProps {
  product: Product
  size?: "small" | "large"
  onPress?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string, imageUrl: string) => void
}

export const ProductCard = ({ product, size = "large", onPress, onEdit, onDelete }: ProductCardProps) => {
  const [showActions, setShowActions] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const scaleAnim = React.useRef(new Animated.Value(1)).current
  const modalScaleAnim = React.useRef(new Animated.Value(0.3)).current
  const modalOpacityAnim = React.useRef(new Animated.Value(0)).current
  const confirmScaleAnim = React.useRef(new Animated.Value(0.3)).current
  const confirmOpacityAnim = React.useRef(new Animated.Value(0)).current

  const cardStyle = size === "small" ? styles.cardSmall : styles.cardLarge
  const imageStyle = size === "small" ? styles.productImageSmall : styles.productImageLarge

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start()
  }

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start()
  }

  const showActionMenu = () => {
    setShowActions(true)
    Animated.parallel([
      Animated.spring(modalScaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(modalOpacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start()
  }

  const hideActionMenu = () => {
    Animated.parallel([
      Animated.spring(modalScaleAnim, {
        toValue: 0.3,
        useNativeDriver: true,
      }),
      Animated.timing(modalOpacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => setShowActions(false))
  }

  const showDeleteConfirmation = () => {
    hideActionMenu()
    setTimeout(() => {
      setShowDeleteConfirm(true)
      Animated.parallel([
        Animated.spring(confirmScaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(confirmOpacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start()
    }, 300)
  }

  const hideDeleteConfirmation = () => {
    Animated.parallel([
      Animated.spring(confirmScaleAnim, {
        toValue: 0.3,
        useNativeDriver: true,
      }),
      Animated.timing(confirmOpacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => setShowDeleteConfirm(false))
  }

  const handleAction = (action: "edit" | "delete") => {
    if (action === "edit") {
      hideActionMenu()
      setTimeout(() => {
        if (onEdit) {
          onEdit(product.id)
        }
      }, 300)
    } else if (action === "delete") {
      showDeleteConfirmation()
    }
  }

  const handleConfirmDelete = () => {
    hideDeleteConfirmation()
    setTimeout(() => {
      if (onDelete) {
        onDelete(product.id, product.imageUrl)
      }
    }, 300)
  }

  return (
    <>
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
        <Pressable
          style={({ pressed }) => [styles.card, cardStyle, pressed && styles.cardPressed]}
          onPress={onPress ? () => onPress(product.id) : undefined}
          onLongPress={showActionMenu}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          delayLongPress={500}
        >
          <Image source={{ uri: product.imageUrl }} style={[styles.productImage, imageStyle]} />
          <Text style={styles.productName}>{product.name}</Text>
          <View style={styles.footer}>
            <TouchableOpacity style={styles.button} onPress={onPress ? () => onPress(product.id) : undefined}>
              <Text style={styles.buttonText}>見る</Text>
            </TouchableOpacity>
            <Text style={styles.price}>¥{product.price}</Text>
          </View>
        </Pressable>
      </Animated.View>

      {/* Action Menu Modal */}
      <Modal visible={showActions} transparent={true} animationType="none" onRequestClose={hideActionMenu}>
        <Pressable style={styles.modalOverlay} onPress={hideActionMenu}>
          <Animated.View
            style={[
              styles.actionMenu,
              {
                opacity: modalOpacityAnim,
                transform: [{ scale: modalScaleAnim }],
              },
            ]}
          >
            <TouchableOpacity style={styles.actionButton} onPress={() => handleAction("edit")}>
              <MaterialIcons name="edit" size={24} color="#007AFF" />
              <Text style={styles.actionText}>Update product</Text>
            </TouchableOpacity>

            <View style={styles.actionDivider} />

            <TouchableOpacity style={styles.actionButton} onPress={() => handleAction("delete")}>
              <MaterialIcons name="delete" size={24} color="#FF3B30" />
              <Text style={[styles.actionText, styles.deleteText]}>Delete product</Text>
            </TouchableOpacity>
          </Animated.View>
        </Pressable>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteConfirm}
        transparent={true}
        animationType="none"
        onRequestClose={hideDeleteConfirmation}
      >
        <Pressable style={styles.modalOverlay} onPress={hideDeleteConfirmation}>
          <Animated.View
            style={[
              styles.confirmDialog,
              {
                opacity: confirmOpacityAnim,
                transform: [{ scale: confirmScaleAnim }],
              },
            ]}
          >
            <View style={styles.confirmContent}>
              <MaterialIcons name="warning" size={32} color="#FF3B30" />
              <Text style={styles.confirmTitle}>Delete Product</Text>
              <Text style={styles.confirmMessage}>
                Are you sure you want to delete this product? This action cannot be undone.
              </Text>
            </View>

            <View style={styles.confirmButtons}>
              <TouchableOpacity style={[styles.confirmButton, styles.cancelButton]} onPress={hideDeleteConfirmation}>
                <Text style={styles.confirmButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.confirmButton, styles.deleteButton]} onPress={handleConfirmDelete}>
                <Text style={[styles.confirmButtonText, styles.deleteButtonText]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
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
    borderColor: "#eee",
  },
  cardPressed: {
    shadowOpacity: 0.05,
    elevation: 1,
  },
  productImage: {
    resizeMode: "contain",
    marginBottom: 8,
    borderRadius: 8,
  },
  productImageSmall: {
    width: 80,
    height: 80,
  },
  productImageLarge: {
    width: "100%",
    aspectRatio: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  button: {
    backgroundColor: "#25523B",
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  buttonText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "bold",
  },
  price: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  actionMenu: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 8,
    width: "80%",
    maxWidth: 300,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 8,
  },
  actionText: {
    fontSize: 16,
    marginLeft: 12,
    color: "#333",
    fontWeight: "500",
  },
  deleteText: {
    color: "#FF3B30",
  },
  actionDivider: {
    height: 1,
    backgroundColor: "#eee",
    marginHorizontal: 8,
  },
  confirmDialog: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "80%",
    maxWidth: 300,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  confirmContent: {
    padding: 24,
    alignItems: "center",
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  confirmMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 8,
  },
  confirmButtons: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  confirmButton: {
    flex: 1,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    borderRightWidth: 1,
    borderRightColor: "#eee",
  },
  deleteButton: {
    backgroundColor: "#FFF1F0",
  },
  deleteButtonText: {
    color: "#FF3B30",
  },
})

