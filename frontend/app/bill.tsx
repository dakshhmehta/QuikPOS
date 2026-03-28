import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import {
  getItems,
  getTables,
  updateTable,
  closeTable,
  MenuItem,
  Table,
  TableItem,
} from '../utils/storage';

export default function BillScreen() {
  const { tableId, tableName } = useLocalSearchParams();
  const router = useRouter();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [table, setTable] = useState<Table | null>(null);
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [showCloseModal, setShowCloseModal] = useState(false);

  const loadData = async () => {
    const menuItems = await getItems();
    setItems(menuItems);

    const tables = await getTables();
    const currentTable = tables.find((t) => t.id === tableId);
    if (currentTable) {
      setTable(currentTable);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [tableId])
  );

  const getItemQuantity = (itemId: string): number => {
    const tableItem = table?.items.find((ti) => ti.itemId === itemId);
    return tableItem?.quantity || 0;
  };

  const handleItemPress = (item: MenuItem) => {
    setSelectedItem(item);
    setShowQuantityModal(true);
  };

  const handleQuantitySelect = async (quantityToAdd: number) => {
    if (!table || !selectedItem) return;

    const updatedItems = [...table.items];
    const existingIndex = updatedItems.findIndex(
      (ti) => ti.itemId === selectedItem.id
    );

    const currentQty = getItemQuantity(selectedItem.id);
    const newQuantity = currentQty + quantityToAdd;

    if (newQuantity <= 0) {
      if (existingIndex !== -1) {
        updatedItems.splice(existingIndex, 1);
      }
    } else {
      const tableItem: TableItem = {
        itemId: selectedItem.id,
        itemName: selectedItem.name,
        quantity: newQuantity,
        price: selectedItem.price,
      };

      if (existingIndex !== -1) {
        updatedItems[existingIndex] = tableItem;
      } else {
        updatedItems.push(tableItem);
      }
    }

    const totalAmount = updatedItems.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );

    const updatedTable: Table = {
      ...table,
      items: updatedItems,
      totalAmount,
    };

    await updateTable(updatedTable);
    setTable(updatedTable);
    setShowQuantityModal(false);
    setSelectedItem(null);
  };

  const updateItemQuantity = async (item: MenuItem, newQuantity: number) => {
    if (!table) return;

    const updatedItems = [...table.items];
    const existingIndex = updatedItems.findIndex(
      (ti) => ti.itemId === item.id
    );

    if (newQuantity <= 0) {
      if (existingIndex !== -1) {
        updatedItems.splice(existingIndex, 1);
      }
    } else {
      const tableItem: TableItem = {
        itemId: item.id,
        itemName: item.name,
        quantity: newQuantity,
        price: item.price,
      };

      if (existingIndex !== -1) {
        updatedItems[existingIndex] = tableItem;
      } else {
        updatedItems.push(tableItem);
      }
    }

    const totalAmount = updatedItems.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );

    const updatedTable: Table = {
      ...table,
      items: updatedItems,
      totalAmount,
    };

    await updateTable(updatedTable);
    setTable(updatedTable);
  };

  const handleIncrement = async (item: MenuItem) => {
    const currentQty = getItemQuantity(item.id);
    await updateItemQuantity(item, currentQty + 1);
  };

  const handleDecrement = async (item: MenuItem) => {
    const currentQty = getItemQuantity(item.id);
    if (currentQty > 0) {
      await updateItemQuantity(item, currentQty - 1);
    }
  };

  const handleCloseTable = () => {
    if (!table || table.items.length === 0) {
      Alert.alert('Error', 'Please add items before closing the table');
      return;
    }
    setShowCloseModal(true);
  };

  const confirmCloseTable = async () => {
    if (!table) return;

    await closeTable(table.id);
    setShowCloseModal(false);
    router.back();
  };

  const renderItem = ({ item }: { item: MenuItem }) => {
    const quantity = getItemQuantity(item.id);

    return (
      <TouchableOpacity
        style={[
          styles.itemCard,
          quantity > 0 && styles.itemCardActive,
        ]}
        onPress={() => handleItemPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.itemContent}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemPrice}>₹{item.price}</Text>
          {quantity > 0 && (
            <>
              <Text style={styles.itemTotal}>
                {item.price} x {quantity} = ₹{item.price * quantity}
              </Text>
              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleDecrement(item);
                  }}
                >
                  <Ionicons name="remove" size={20} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleIncrement(item);
                  }}
                >
                  <Ionicons name="add" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderQuantityPad = () => {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
    const currentQty = selectedItem ? getItemQuantity(selectedItem.id) : 0;
    return (
      <View style={styles.quantityPad}>
        <Text style={styles.quantityPadTitle}>Add Quantity</Text>
        <Text style={styles.quantityPadItem}>{selectedItem?.name}</Text>
        {currentQty > 0 && (
          <Text style={styles.quantityPadCurrent}>Current: {currentQty}</Text>
        )}
        <View style={styles.numberGrid}>
          {numbers.map((num) => (
            <TouchableOpacity
              key={num}
              style={styles.numberButton}
              onPress={() => handleQuantitySelect(num)}
            >
              <Text style={styles.numberButtonText}>{num}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          style={styles.cancelPadButton}
          onPress={() => {
            setShowQuantityModal(false);
            setSelectedItem(null);
          }}
        >
          <Text style={styles.cancelPadButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.tableTitle}>Table: {tableName}</Text>
        <Text style={styles.totalAmount}>Total: ₹{table?.totalAmount || 0}</Text>
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="fast-food-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No menu items available</Text>
          <Text style={styles.emptySubText}>Add items from Menu Items tab</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.gridContainer}
        />
      )}

      <TouchableOpacity
        style={styles.closeTableButton}
        onPress={handleCloseTable}
      >
        <Ionicons name="checkmark-circle" size={24} color="#fff" />
        <Text style={styles.closeTableButtonText}>Close Table</Text>
      </TouchableOpacity>

      <Modal
        visible={showQuantityModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowQuantityModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>{renderQuantityPad()}</View>
        </View>
      </Modal>

      <Modal
        visible={showCloseModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCloseModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.closeModalContent}>
            <Ionicons name="receipt-outline" size={64} color="#FF6B35" />
            <Text style={styles.closeModalTitle}>Table {tableName}</Text>
            
            <ScrollView style={styles.billItemsContainer}>
              {table?.items.map((item, index) => (
                <View key={index} style={styles.billItemRow}>
                  <Text style={styles.billItemName}>{item.itemName}</Text>
                  <Text style={styles.billItemQty}>x{item.quantity}</Text>
                  <Text style={styles.billItemPrice}>₹{item.price * item.quantity}</Text>
                </View>
              ))}
            </ScrollView>

            <View style={styles.billDivider} />
            
            <View style={styles.billTotalRow}>
              <Text style={styles.billTotalLabel}>Total Amount:</Text>
              <Text style={styles.billTotalAmount}>₹{table?.totalAmount || 0}</Text>
            </View>

            <View style={styles.closeModalButtons}>
              <TouchableOpacity
                style={[styles.closeModalButton, styles.cancelCloseButton]}
                onPress={() => setShowCloseModal(false)}
              >
                <Text style={styles.cancelCloseButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.closeModalButton, styles.confirmCloseButton]}
                onPress={confirmCloseTable}
              >
                <Text style={styles.confirmCloseButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tableTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  gridContainer: {
    padding: 12,
  },
  itemCard: {
    flex: 1,
    margin: 6,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    minHeight: 140,
    maxWidth: '47%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemCardActive: {
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  itemContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF6B35',
    marginBottom: 8,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  quantityButton: {
    backgroundColor: '#FF6B35',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginTop: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 8,
    textAlign: 'center',
  },
  closeTableButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  closeTableButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  quantityPad: {
    alignItems: 'center',
  },
  quantityPadTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  quantityPadItem: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  quantityPadCurrent: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: 16,
  },
  numberGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  numberButton: {
    width: 80,
    height: 80,
    backgroundColor: '#FF6B35',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberButtonText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  cancelPadButton: {
    width: '100%',
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelPadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  closeModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    maxHeight: '80%',
  },
  closeModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  billItemsContainer: {
    maxHeight: 200,
    marginBottom: 16,
  },
  billItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    alignItems: 'center',
  },
  billItemName: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  billItemQty: {
    fontSize: 16,
    color: '#666',
    marginRight: 16,
    width: 40,
    textAlign: 'center',
  },
  billItemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    width: 80,
    textAlign: 'right',
  },
  billDivider: {
    height: 2,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  billTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  billTotalLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  billTotalAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  closeModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  closeModalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelCloseButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelCloseButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmCloseButton: {
    backgroundColor: '#4CAF50',
  },
  confirmCloseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
