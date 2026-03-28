# Dhaba Management App - User Guide

## 📱 Offline Mobile Application for Dhaba Table & Billing Management

### ✨ Features

#### 1. **Running Tables** (Home Tab)
- **View**: Grid layout showing all active tables
- **Add Table**: Tap the orange '+' button to create a new table with custom name (e.g., "1", "2", "4-1", "4-2")
- **Table Card**: Shows table name and number of items (if any)
- **Click Table**: Opens the bill screen for that table

#### 2. **Bill Screen** (Modal)
- **Header**: Displays table name and current total amount
- **Items Grid**: Shows all menu items in a 2-column grid
- **Item Card Features**:
  - Item name and price
  - When clicked: Opens numeric keypad (0-9) to select quantity
  - Shows current quantity with +/- buttons for quick adjustments
  - Active items highlighted with orange border
- **Close Table Button**: 
  - Green button at bottom
  - Shows complete bill with all items
  - Displays total amount for customer
  - Confirm to close and move to history

#### 3. **Closed Tables** (History Tab)
- **Date Filter**: Top action bar with date picker
  - Tap to select any date
  - Only shows tables closed on selected date
- **List View**: Shows table name, closed time, and total amount
- **Click Table**: Opens detailed view with:
  - Closed timestamp
  - All items with quantities and prices
  - Total amount

#### 4. **Menu Items** (Admin Tab)
- **Item List**: All menu items with name and price
- **Add Item**: Tap '+' button to add new menu item
- **Edit Item**: Tap green edit icon to modify
- **Delete Item**: Tap red trash icon to remove (with confirmation)

### 🎨 Design Highlights
- **Color Scheme**: Orange (#FF6B35) primary color for dhaba theme
- **Icons**: Ionicons for all UI elements
- **Touch-Friendly**: All buttons minimum 44x44 points
- **Mobile-First**: Optimized for one-handed use
- **Offline**: All data stored locally using AsyncStorage

### 💾 Data Storage
- **No Backend Required**: Pure offline app
- **Local Storage**: Uses React Native AsyncStorage
- **Data Persistence**: All tables and items saved locally on device
- **No Login**: Single user app, no authentication needed

### 📲 How to Use

1. **Setup Menu Items First**:
   - Go to "Menu Items" tab
   - Add your dhaba items (e.g., "Chai ₹10", "Paratha ₹40")

2. **Start Taking Orders**:
   - Go to "Running Tables" tab
   - Tap '+' to create a new table (e.g., "1")
   - Tap the table card to open bill screen
   - Tap items to add quantities
   - Use +/- buttons for quick adjustments

3. **Close Table**:
   - When customer is ready to pay
   - Tap "Close Table" button
   - Review bill with customer
   - Tap "Confirm" to close
   - Table moves to "Closed Tables" history

4. **View History**:
   - Go to "Closed Tables" tab
   - Use date picker to filter by date
   - Tap any closed table to see full bill details

### 🔧 Technical Details
- **Framework**: Expo (React Native)
- **Navigation**: React Navigation with Bottom Tabs
- **Storage**: @react-native-async-storage/async-storage
- **Date Picker**: @react-native-community/datetimepicker
- **Icons**: @expo/vector-icons (Ionicons)

### 🌐 Access
- **Web Preview**: https://dhaba-bill.preview.emergentagent.com
- **Mobile**: Scan QR code with Expo Go app

---

**Built with ❤️ for small dhaba owners**
