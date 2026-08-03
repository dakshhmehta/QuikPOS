import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  RefreshControl,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getClosedTablesByDate, deleteTablesByDate, Table } from '../../utils/storage';

export default function ClosedTablesScreen() {
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const dateInputRef = useRef<any>(null);

  const loadTables = async (date: Date) => {
    const closedTables = await getClosedTablesByDate(date);
    setTables(closedTables);
  };

  useFocusEffect(
    useCallback(() => {
      loadTables(selectedDate);
    }, [selectedDate])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTables(selectedDate);
    setRefreshing(false);
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'web') {
      const value = event.target.value;
      if (value) {
        const newDate = new Date(value);
        if (!isNaN(newDate.getTime())) {
          setSelectedDate(newDate);
          loadTables(newDate);
        }
      }
      return;
    }

    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
      loadTables(date);
    }
  };

  const handleWebPickerClick = () => {
    if (dateInputRef.current) {
      try {
        if (typeof dateInputRef.current.showPicker === 'function') {
          dateInputRef.current.showPicker();
        } else {
          dateInputRef.current.click();
        }
      } catch (e) {
        // Fallback for older browsers
        dateInputRef.current.click();
      }
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleClearDayData = async () => {
    await deleteTablesByDate(selectedDate);
    setShowClearConfirm(false);
    loadTables(selectedDate);
    if (Platform.OS === 'web') {
      window.alert("Cleared all data for the selected date.");
    } else {
      alert("Cleared all data for the selected date.");
    }
  };

  const handleDownloadToday = async () => {
    const today = new Date();
    const todayTables = await getClosedTablesByDate(today);

    if (todayTables.length === 0) {
      if (Platform.OS === 'web') {
        window.alert("No sales data found for today.");
      } else {
        alert("No sales data found for today.");
      }
      return;
    }

    // CSV Header
    let csv = "Date,Time,Table,Persons,Items,Amount\n";

    todayTables.forEach((table) => {
      const dateStr = new Date(table.closedAt || 0).toLocaleDateString('en-IN');
      const timeStr = new Date(table.closedAt || 0).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      });
      // Escape quotes in item names and join with semicolon to avoid CSV conflicts
      const itemsStr = table.items
        .map((i) => `${i.itemName.replace(/"/g, '""')} (x${i.quantity})`)
        .join("; ");

      csv += `"${dateStr}","${timeStr}","${table.name.replace(/"/g, '""')}",${table.numPersons},"${itemsStr}",${table.totalAmount}\n`;
    });

    if (Platform.OS === 'web') {
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Sales_Report_${today.toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert("Download is currently optimized for Web PWA.");
    }
  };

  const renderTable = ({ item }: { item: Table }) => (
    <TouchableOpacity
      style={styles.tableCard}
      onPress={() => setSelectedTable(item)}
      activeOpacity={0.7}
    >
      <View style={styles.tableHeader}>
        <View style={styles.tableInfo}>
          <Text style={styles.tableName}>{item.name}</Text>
          <Text style={styles.tableTime}>
            Closed at {formatTime(item.closedAt || 0)}
          </Text>
        </View>
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Total</Text>
          <Text style={styles.amount}>₹{item.totalAmount}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.dateFilterContainer}>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => {
            if (Platform.OS === 'web') {
              handleWebPickerClick();
            } else {
              setShowDatePicker(true);
            }
          }}
        >
          <Ionicons name="calendar-outline" size={20} color="#FF6B35" />
          <Text style={styles.dateButtonText}>{formatDate(selectedDate)}</Text>
          <Ionicons name="chevron-down" size={20} color="#FF6B35" />
          
          {Platform.OS === 'web' && (
            <input
              ref={dateInputRef}
              type="date"
              value={selectedDate.toISOString().split('T')[0]}
              onChange={handleDateChange}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                zIndex: -1, // Keep it in DOM but hidden
                pointerEvents: 'none',
              }}
              max={new Date().toISOString().split('T')[0]}
            />
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={tables}
        renderItem={renderTable}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No closed tables</Text>
            <Text style={styles.emptySubText}>
              for {formatDate(selectedDate)}
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={[styles.fab, styles.downloadFab]}
          onPress={handleDownloadToday}
          activeOpacity={0.8}
        >
          <Ionicons name="download" size={26} color="#fff" />
        </TouchableOpacity>
        
        {tables.length > 0 && (
          <TouchableOpacity
            style={[styles.fab, styles.clearFab]}
            onPress={() => setShowClearConfirm(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="trash-outline" size={26} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {showDatePicker && Platform.OS !== 'web' && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}

      <Modal
        visible={selectedTable !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedTable(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Table {selectedTable?.name}</Text>
              <TouchableOpacity onPress={() => setSelectedTable(null)}>
                <Ionicons name="close" size={28} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.detailsContainer}>
              <Text style={styles.detailLabel}>Closed At:</Text>
              <Text style={styles.detailValue}>
                {selectedTable?.closedAt
                  ? new Date(selectedTable.closedAt).toLocaleString('en-IN')
                  : '-'}
              </Text>
            </View>

            <View style={styles.divider} />

            <Text style={styles.itemsTitle}>Items:</Text>
            {selectedTable?.items.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <Text style={styles.itemName}>{item.itemName}</Text>
                <Text style={styles.itemQty}>x{item.quantity}</Text>
                <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
              </View>
            ))}

            {selectedTable?.items.length === 0 && (
              <Text style={styles.noItemsText}>No items in this order</Text>
            )}

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount:</Text>
              <Text style={styles.totalAmount}>₹{selectedTable?.totalAmount}</Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* Clear Data Confirmation Modal */}
      <Modal
        visible={showClearConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowClearConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.alertModalContent}>
            <Ionicons name="alert-circle-outline" size={48} color="#F44336" />
            <Text style={styles.alertModalTitle}>Clear Sales Data</Text>
            <Text style={styles.alertModalMessage}>
              Are you sure you want to delete all closed table data for <Text style={styles.boldText}>{formatDate(selectedDate)}</Text>? This action cannot be undone.
            </Text>
            <View style={styles.alertModalButtons}>
              <TouchableOpacity
                style={[styles.alertModalButton, styles.alertCancelButton]}
                onPress={() => setShowClearConfirm(false)}
              >
                <Text style={styles.alertCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.alertModalButton, styles.alertDeleteButton]}
                onPress={handleClearDayData}
              >
                <Text style={styles.alertDeleteText}>Clear Data</Text>
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
  dateFilterContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF6B35',
    gap: 8,
  },
  dateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  tableCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tableInfo: {
    flex: 1,
  },
  tableName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  tableTime: {
    fontSize: 14,
    color: '#666',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amountLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B35',
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
    maxHeight: '80%',
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
  detailsContainer: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  itemsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    alignItems: 'center',
  },
  itemName: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  itemQty: {
    fontSize: 16,
    color: '#666',
    marginRight: 16,
    width: 40,
    textAlign: 'center',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    width: 80,
    textAlign: 'right',
  },
  noItemsText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  fabContainer: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    gap: 16,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  downloadFab: {
    backgroundColor: '#4CAF50',
  },
  clearFab: {
    backgroundColor: '#F44336',
  },
  alertModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    margin: 40,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  alertModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  alertModalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#333',
  },
  alertModalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  alertModalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  alertCancelButton: {
    backgroundColor: '#f0f0f0',
  },
  alertCancelText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  alertDeleteButton: {
    backgroundColor: '#F44336',
  },
  alertDeleteText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
