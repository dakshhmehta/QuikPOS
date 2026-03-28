import AsyncStorage from '@react-native-async-storage/async-storage';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
}

export interface TableItem {
  itemId: string;
  itemName: string;
  quantity: number;
  price: number;
}

export interface TableMaster {
  id: string;
  name: string;
  maxSeats: number;
}

export interface Table {
  id: string;
  tableMasterId: string;
  name: string;
  numPersons: number;
  status: 'running' | 'closed';
  items: TableItem[];
  totalAmount: number;
  createdAt: number;
  closedAt: number | null;
}

const ITEMS_KEY = '@dhaba_items';
const TABLES_KEY = '@dhaba_tables';
const TABLE_MASTERS_KEY = '@dhaba_table_masters';

// Items operations
export const getItems = async (): Promise<MenuItem[]> => {
  try {
    const items = await AsyncStorage.getItem(ITEMS_KEY);
    return items ? JSON.parse(items) : [];
  } catch (error) {
    console.error('Error getting items:', error);
    return [];
  }
};

export const saveItems = async (items: MenuItem[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(ITEMS_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Error saving items:', error);
  }
};

export const addItem = async (name: string, price: number): Promise<MenuItem> => {
  const items = await getItems();
  const newItem: MenuItem = {
    id: Date.now().toString(),
    name,
    price,
  };
  items.push(newItem);
  await saveItems(items);
  return newItem;
};

export const updateItem = async (id: string, name: string, price: number): Promise<void> => {
  const items = await getItems();
  const index = items.findIndex(item => item.id === id);
  if (index !== -1) {
    items[index] = { id, name, price };
    await saveItems(items);
  }
};

export const deleteItem = async (id: string): Promise<void> => {
  const items = await getItems();
  const filtered = items.filter(item => item.id !== id);
  await saveItems(filtered);
};

// Table Masters operations
export const getTableMasters = async (): Promise<TableMaster[]> => {
  try {
    const masters = await AsyncStorage.getItem(TABLE_MASTERS_KEY);
    return masters ? JSON.parse(masters) : [];
  } catch (error) {
    console.error('Error getting table masters:', error);
    return [];
  }
};

export const saveTableMasters = async (masters: TableMaster[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(TABLE_MASTERS_KEY, JSON.stringify(masters));
  } catch (error) {
    console.error('Error saving table masters:', error);
  }
};

export const addTableMaster = async (name: string, maxSeats: number): Promise<TableMaster> => {
  const masters = await getTableMasters();
  const newMaster: TableMaster = {
    id: Date.now().toString(),
    name,
    maxSeats,
  };
  masters.push(newMaster);
  await saveTableMasters(masters);
  return newMaster;
};

export const updateTableMaster = async (id: string, name: string, maxSeats: number): Promise<void> => {
  const masters = await getTableMasters();
  const index = masters.findIndex(m => m.id === id);
  if (index !== -1) {
    masters[index] = { id, name, maxSeats };
    await saveTableMasters(masters);
  }
};

export const deleteTableMaster = async (id: string): Promise<void> => {
  const masters = await getTableMasters();
  const filtered = masters.filter(m => m.id !== id);
  await saveTableMasters(filtered);
};

export const getTableOccupancy = async (tableMasterId: string): Promise<{ maxSeats: number; occupiedSeats: number; availableSeats: number }> => {
  const masters = await getTableMasters();
  const master = masters.find(m => m.id === tableMasterId);
  if (!master) {
    return { maxSeats: 0, occupiedSeats: 0, availableSeats: 0 };
  }

  const tables = await getTables();
  const runningTables = tables.filter(t => t.tableMasterId === tableMasterId && t.status === 'running');
  const occupiedSeats = runningTables.reduce((sum, t) => sum + t.numPersons, 0);
  const availableSeats = Math.max(0, master.maxSeats - occupiedSeats);

  return {
    maxSeats: master.maxSeats,
    occupiedSeats,
    availableSeats,
  };
};

export const getAvailableTableMasters = async (): Promise<(TableMaster & { availableSeats: number; occupiedSeats: number })[]> => {
  const masters = await getTableMasters();
  const result = [];

  for (const master of masters) {
    const occupancy = await getTableOccupancy(master.id);
    if (occupancy.availableSeats > 0) {
      result.push({
        ...master,
        availableSeats: occupancy.availableSeats,
        occupiedSeats: occupancy.occupiedSeats,
      });
    }
  }

  return result;
};

// Tables operations
export const getTables = async (): Promise<Table[]> => {
  try {
    const tables = await AsyncStorage.getItem(TABLES_KEY);
    return tables ? JSON.parse(tables) : [];
  } catch (error) {
    console.error('Error getting tables:', error);
    return [];
  }
};

export const saveTables = async (tables: Table[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(TABLES_KEY, JSON.stringify(tables));
  } catch (error) {
    console.error('Error saving tables:', error);
  }
};

export const addTable = async (tableMasterId: string, name: string, numPersons: number): Promise<Table> => {
  const tables = await getTables();
  const newTable: Table = {
    id: Date.now().toString(),
    tableMasterId,
    name,
    numPersons,
    status: 'running',
    items: [],
    totalAmount: 0,
    createdAt: Date.now(),
    closedAt: null,
  };
  tables.push(newTable);
  await saveTables(tables);
  return newTable;
};

export const updateTable = async (table: Table): Promise<void> => {
  const tables = await getTables();
  const index = tables.findIndex(t => t.id === table.id);
  if (index !== -1) {
    tables[index] = table;
    await saveTables(tables);
  }
};

export const closeTable = async (tableId: string): Promise<void> => {
  const tables = await getTables();
  const table = tables.find(t => t.id === tableId);
  if (table) {
    table.status = 'closed';
    table.closedAt = Date.now();
    await saveTables(tables);
  }
};

export const getRunningTables = async (): Promise<Table[]> => {
  const tables = await getTables();
  return tables.filter(t => t.status === 'running');
};

export const getClosedTables = async (): Promise<Table[]> => {
  const tables = await getTables();
  return tables.filter(t => t.status === 'closed').sort((a, b) => (b.closedAt || 0) - (a.closedAt || 0));
};

export const getClosedTablesByDate = async (date: Date): Promise<Table[]> => {
  const tables = await getClosedTables();
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return tables.filter(t => {
    const closedAt = t.closedAt || 0;
    return closedAt >= startOfDay.getTime() && closedAt <= endOfDay.getTime();
  });
};

export const deleteTable = async (tableId: string): Promise<void> => {
  const tables = await getTables();
  const filtered = tables.filter(t => t.id !== tableId);
  await saveTables(filtered);
};
