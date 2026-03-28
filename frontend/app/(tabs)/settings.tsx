import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import {
  getItems,
  addItem,
  updateItem,
  deleteItem,
  MenuItem,
  getTableMasters,
  addTableMaster,
  updateTableMaster,
  deleteTableMaster,
  TableMaster,
} from '../../utils/storage';

export default function SettingsScreen() {
  // Menu Items state
  const [items, setItems] = useState<MenuItem[]>([]);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');

  // Table Masters state
  const [tableMasters, setTableMasters] = useState<TableMaster[]>([]);
  const [showTableModal, setShowTableModal] = useState(false);
  const [editingTable, setEditingTable] = useState<TableMaster | null>(null);
  const [tableName, setTableName] = useState('');
  const [maxSeats, setMaxSeats] = useState('');

  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    const allItems = await getItems();
    setItems(allItems);

    const masters = await getTableMasters();
    setTableMasters(masters);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Menu Items handlers
  const handleSaveItem = async () => {
    if (!itemName.trim()) {
      Alert.alert('Error', 'Item name is required');
      return;
    }

    const price = parseFloat(itemPrice);
    if (isNaN(price) || price <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    if (editingItem) {
      await updateItem(editingItem.id, itemName.trim(), price);
    } else {
      await addItem(itemName.trim(), price);
    }

    resetItemForm();
    loadData();
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setItemName(item.name);
    setItemPrice(item.price.toString());
    setShowItemModal(true);
  };

  const handleDeleteItem = (item: MenuItem) => {
    Alert.alert('Delete Item', `Are you sure you want to delete "${item.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteItem(item.id);
          loadData();
        },
      },
    ]);
  };

  const resetItemForm = () => {
    setShowItemModal(false);
    setEditingItem(null);
    setItemName('');
    setItemPrice('');
  };

  // Table Masters handlers
  const handleSaveTable = async () => {
    if (!tableName.trim()) {
      Alert.alert('Error', 'Table name is required');
      return;
    }

    const seats = parseInt(maxSeats);
    if (isNaN(seats) || seats <= 0) {
      Alert.alert('Error', 'Please enter a valid number of seats');
      return;
    }

    if (editingTable) {
      await updateTableMaster(editingTable.id, tableName.trim(), seats);
    } else {
      await addTableMaster(tableName.trim(), seats);
    }

    resetTableForm();
    loadData();
  };

  const handleEditTable = (table: TableMaster) => {
    setEditingTable(table);
    setTableName(table.name);
    setMaxSeats(table.maxSeats.toString());
    setShowTableModal(true);
  };

  const handleDeleteTable = (table: TableMaster) => {
    Alert.alert('Delete Table', `Are you sure you want to delete table "${table.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteTableMaster(table.id);
          loadData();
        },
      },
    ]);
  };

  const resetTableForm = () => {
    setShowTableModal(false);
    setEditingTable(null);
    setTableName('');
    setMaxSeats('');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Table Masters Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="grid" size={24} color="#FF6B35" />
            <Text style={styles.sectionTitle}>Table Management</Text>
            <TouchableOpacity
              style={styles.addIconButton}
              onPress={() => setShowTableModal(true)}
            >
              <Ionicons name="add-circle" size={28} color="#FF6B35" />
            </TouchableOpacity>
          </View>

          {tableMasters.length === 0 ? (
            <View style={styles.emptySection}>
              <Text style={styles.emptySectionText}>No tables configured</Text>
              <Text style={styles.emptySectionSubText}>Tap + to add tables</Text>
            </View>
          ) : (
            <View style={styles.listContent}>
              {tableMasters.map((table) => (
                <View key={table.id} style={styles.card}>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardName}>{table.name}</Text>
                    <Text style={styles.cardDetail}>Max Seats: {table.maxSeats}</Text>
                  </View>
                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleEditTable(table)}
                    >
                      <Ionicons name="create-outline" size={24} color="#4CAF50" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleDeleteTable(table)}
                    >
                      <Ionicons name="trash-outline" size={24} color="#F44336" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.divider} />

        {/* Menu Items Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="fast-food" size={24} color="#FF6B35" />
            <Text style={styles.sectionTitle}>Menu Items</Text>
            <TouchableOpacity
              style={styles.addIconButton}
              onPress={() => setShowItemModal(true)}
            >
              <Ionicons name="add-circle" size={28} color="#FF6B35" />
            </TouchableOpacity>
          </View>

          {items.length === 0 ? (
            <View style={styles.emptySection}>
              <Text style={styles.emptySectionText}>No menu items</Text>
              <Text style={styles.emptySectionSubText}>Tap + to add items</Text>
            </View>
          ) : (
            <View style={styles.listContent}>
              {items.map((item) => (
                <View key={item.id} style={styles.card}>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardName}>{item.name}</Text>
                    <Text style={styles.cardPrice}>₹{item.price}</Text>
                  </View>
                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleEditItem(item)}
                    >
                      <Ionicons name="create-outline" size={24} color="#4CAF50" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleDeleteItem(item)}
                    >
                      <Ionicons name="trash-outline" size={24} color="#F44336" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Table Master Modal */}
      <Modal
        visible={showTableModal}
        transparent
        animationType="fade"
        onRequestClose={resetTableForm}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingTable ? 'Edit Table' : 'Add New Table'}
            </Text>

            <Text style={styles.label}>Table Name/Number</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 1, 2, 4-1, VIP-1"
              value={tableName}
              onChangeText={setTableName}
              autoFocus
            />

            <Text style={styles.label}>Maximum Seats</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 4, 6, 8"
              value={maxSeats}
              onChangeText={setMaxSeats}
              keyboardType="numeric"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={resetTableForm}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveTable}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Menu Item Modal */}
      <Modal
        visible={showItemModal}
        transparent
        animationType="fade"
        onRequestClose={resetItemForm}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingItem ? 'Edit Item' : 'Add New Item'}
            </Text>

            <Text style={styles.label}>Item Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Chai, Paratha"
              value={itemName}
              onChangeText={setItemName}
              autoFocus
            />

            <Text style={styles.label}>Price (₹)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 10, 40"
              value={itemPrice}
              onChangeText={setItemPrice}
              keyboardType="numeric"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={resetItemForm}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveItem}
              >
                <Text style={styles.saveButtonText}>Save</Text>
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
  section: {
    backgroundColor: '#fff',
    marginBottom: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    gap: 12,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  addIconButton: {
    padding: 4,
  },
  listContent: {
    padding: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  cardDetail: {
    fontSize: 14,
    color: '#666',
  },
  cardPrice: {
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 8,
  },
  emptySection: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptySectionText: {
    fontSize: 16,
    color: '#999',
  },
  emptySectionSubText: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 4,
  },
  divider: {
    height: 8,
    backgroundColor: '#f5f5f5',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#FF6B35',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
