import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { getRunningTables, addTable, Table, getAvailableTableMasters, TableMaster } from '../../utils/storage';

export default function RunningTablesScreen() {
  const [tables, setTables] = useState<Table[]>([]);
  const [showTableSelectModal, setShowTableSelectModal] = useState(false);
  const [showPersonsModal, setShowPersonsModal] = useState(false);
  const [availableTables, setAvailableTables] = useState<(TableMaster & { availableSeats: number; occupiedSeats: number })[]>([]);
  const [selectedTableMaster, setSelectedTableMaster] = useState<(TableMaster & { availableSeats: number; occupiedSeats: number }) | null>(null);
  const [numPersons, setNumPersons] = useState('');
  const [personsError, setPersonsError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const loadTables = async () => {
    const runningTables = await getRunningTables();
    setTables(runningTables);
    
    const available = await getAvailableTableMasters();
    setAvailableTables(available);
  };

  useFocusEffect(
    useCallback(() => {
      loadTables();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTables();
    setRefreshing(false);
  };

  const handleAddTableClick = async () => {
    const available = await getAvailableTableMasters();
    if (available.length === 0) {
      Alert.alert('No Tables Available', 'All tables are full. Please add more tables in Settings or wait for tables to close.');
      return;
    }
    setAvailableTables(available);
    setShowTableSelectModal(true);
  };

  const handleTableMasterSelect = (tableMaster: TableMaster & { availableSeats: number; occupiedSeats: number }) => {
    setSelectedTableMaster(tableMaster);
    setShowTableSelectModal(false);
    setNumPersons('');
    setPersonsError('');
    setShowPersonsModal(true);
  };

  const validatePersons = (value: string): boolean => {
    if (!selectedTableMaster) return false;
    
    if (!value.trim()) {
      setPersonsError('Number of persons is required');
      return false;
    }

    const persons = parseInt(value);
    if (isNaN(persons)) {
      setPersonsError('Please enter a valid number');
      return false;
    }

    if (persons <= 0) {
      setPersonsError('Must be at least 1 person');
      return false;
    }

    if (persons > selectedTableMaster.availableSeats) {
      setPersonsError(`Only ${selectedTableMaster.availableSeats} seat${selectedTableMaster.availableSeats === 1 ? '' : 's'} available`);
      return false;
    }

    setPersonsError('');
    return true;
  };

  const handlePersonsChange = (value: string) => {
    setNumPersons(value);
    if (value.trim()) {
      validatePersons(value);
    } else {
      setPersonsError('Number of persons is required');
    }
  };

  const handleConfirmPersons = async () => {
    if (!selectedTableMaster) return;

    if (!validatePersons(numPersons)) {
      return;
    }

    const persons = parseInt(numPersons);
    await addTable(selectedTableMaster.id, selectedTableMaster.name, persons);
    setNumPersons('');
    setPersonsError('');
    setSelectedTableMaster(null);
    setShowPersonsModal(false);
    loadTables();
  };

  const isConfirmDisabled = !numPersons.trim() || personsError !== '';

  const handleTablePress = (table: Table) => {
    router.push({
      pathname: '/bill',
      params: { tableId: table.id, tableName: `${table.name} (${table.numPersons} person${table.numPersons > 1 ? 's' : ''})` },
    });
  };

  const renderTable = ({ item }: { item: Table }) => (
    <TouchableOpacity
      style={styles.tableCard}
      onPress={() => handleTablePress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.tableIcon}>
        <Ionicons name="restaurant-outline" size={32} color="#FF6B35" />
      </View>
      <Text style={styles.tableName}>{item.name}</Text>
      <Text style={styles.tablePersons}>{item.numPersons} {item.numPersons === 1 ? 'person' : 'persons'}</Text>
      {item.items.length > 0 && (
        <View style={styles.itemsBadge}>
          <Text style={styles.itemsBadgeText}>{item.items.length}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderAvailableTable = ({ item }: { item: TableMaster & { availableSeats: number; occupiedSeats: number } }) => (
    <TouchableOpacity
      style={styles.tableMasterCard}
      onPress={() => handleTableMasterSelect(item)}
      activeOpacity={0.7}
    >
      <View style={styles.tableMasterIcon}>
        <Ionicons name="restaurant" size={28} color="#FF6B35" />
      </View>
      <Text style={styles.tableMasterName}>{item.name}</Text>
      <View style={styles.seatsInfo}>
        <Text style={styles.seatsLabel}>Available:</Text>
        <Text style={styles.seatsValue}>{item.availableSeats}/{item.maxSeats}</Text>
      </View>
      {item.occupiedSeats > 0 && (
        <Text style={styles.occupiedInfo}>({item.occupiedSeats} occupied)</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={tables}
        renderItem={renderTable}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.gridContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="restaurant-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No running tables</Text>
            <Text style={styles.emptySubText}>Tap + to add a new table</Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={handleAddTableClick}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      {/* Table Selection Modal */}
      <Modal
        visible={showTableSelectModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTableSelectModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Table</Text>
              <TouchableOpacity onPress={() => setShowTableSelectModal(false)}>
                <Ionicons name="close" size={28} color="#666" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={availableTables}
              renderItem={renderAvailableTable}
              keyExtractor={(item) => item.id}
              numColumns={2}
              contentContainerStyle={styles.tableMasterGrid}
              ListEmptyComponent={
                <View style={styles.emptyModalContainer}>
                  <Ionicons name="alert-circle-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyModalText}>No tables available</Text>
                  <Text style={styles.emptyModalSubText}>Add tables in Settings</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>

      {/* Number of Persons Modal */}
      <Modal
        visible={showPersonsModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowPersonsModal(false);
          setSelectedTableMaster(null);
          setNumPersons('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.personsModalContent}>
            <Text style={styles.personsModalTitle}>Table {selectedTableMaster?.name}</Text>
            <View style={styles.seatsInfoLarge}>
              <Text style={styles.seatsInfoText}>
                Available Seats: <Text style={styles.seatsHighlight}>{selectedTableMaster?.availableSeats}</Text> / {selectedTableMaster?.maxSeats}
              </Text>
            </View>
            <Text style={styles.inputLabel}>Number of Persons</Text>
            <TextInput
              style={[styles.input, personsError ? styles.inputError : null]}
              placeholder="Enter number of persons"
              value={numPersons}
              onChangeText={handlePersonsChange}
              keyboardType="numeric"
              autoFocus
              maxLength={2}
            />
            {personsError ? (
              <Text style={styles.errorText}>{personsError}</Text>
            ) : null}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowPersonsModal(false);
                  setSelectedTableMaster(null);
                  setNumPersons('');
                  setPersonsError('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton, 
                  styles.confirmButton,
                  isConfirmDisabled && styles.confirmButtonDisabled
                ]}
                onPress={handleConfirmPersons}
                disabled={isConfirmDisabled}
              >
                <Text style={[
                  styles.confirmButtonText,
                  isConfirmDisabled && styles.confirmButtonTextDisabled
                ]}>Confirm</Text>
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
  gridContainer: {
    padding: 12,
    flexGrow: 1,
  },
  tableCard: {
    flex: 1,
    margin: 6,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 130,
    maxWidth: '31%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tableIcon: {
    marginBottom: 8,
  },
  tableName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  tablePersons: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  itemsBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemsBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginTop: 16,
    fontWeight: '600',
  },
  emptySubText: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 8,
  },
  addButton: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
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
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  tableMasterGrid: {
    paddingTop: 8,
  },
  tableMasterCard: {
    flex: 1,
    margin: 6,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minHeight: 140,
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  tableMasterIcon: {
    marginBottom: 8,
  },
  tableMasterName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  seatsInfo: {
    alignItems: 'center',
    marginTop: 4,
  },
  seatsLabel: {
    fontSize: 12,
    color: '#666',
  },
  seatsValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  occupiedInfo: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  emptyModalContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyModalText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
  emptyModalSubText: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 4,
  },
  personsModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    margin: 20,
  },
  personsModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  seatsInfoLarge: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  seatsInfoText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  seatsHighlight: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  inputLabel: {
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
    marginBottom: 8,
  },
  inputError: {
    borderColor: '#F44336',
    borderWidth: 2,
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    marginBottom: 12,
    marginTop: -4,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
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
  confirmButton: {
    backgroundColor: '#FF6B35',
  },
  confirmButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonTextDisabled: {
    color: '#999',
  },
});
