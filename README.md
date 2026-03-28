# QuikPOS - Point of Sale System for Small Restaurants

QuikPOS is a powerful, offline-first mobile point-of-sale application designed specifically for small restaurants, dhabas, and cafes. Manage tables, orders, and bills efficiently with real-time occupancy tracking and intelligent table management.

## 🌟 Key Features

### Table Management
- **Table Masters**: Pre-configure tables with seating capacity
- **Smart Occupancy Tracking**: Automatic seat availability calculation
- **Multiple Instances**: Same table can serve multiple groups simultaneously
- **Real-time Availability**: Tables auto-hide when fully occupied

### Order Management
- **Quick Billing**: Fast item selection with quantity controls
- **Numeric Keypad**: Quick quantity entry with visual feedback
- **Item Totals**: Real-time calculation showing price × qty = total
- **Smart Validation**: Prevents over-booking with inline error messages

### Menu Management
- **Easy CRUD**: Add, edit, delete menu items
- **Price Management**: Simple pricing controls
- **Category-free**: Optimized for small menus (10-20 items)

### History & Reports
- **Closed Tables**: Complete order history
- **Date Filtering**: View orders by specific date
- **Bill Details**: Full breakdown of all orders
- **Smart Discards**: Empty orders don't clutter history

### Offline First
- **100% Offline**: No internet required
- **Local Storage**: All data in AsyncStorage
- **Instant Performance**: No API latency
- **Privacy**: Data never leaves device

## 📱 Technology Stack

- **Frontend**: Expo (React Native)
- **Navigation**: React Navigation with Bottom Tabs
- **Storage**: AsyncStorage (offline local storage)
- **State**: React Hooks
- **UI**: Custom design with Ionicons

## 🎨 Design Highlights

- **Orange Theme** (#FF6B35) - Warm, restaurant-friendly colors
- **Touch-Optimized**: Minimum 44px touch targets
- **Mobile-First**: Designed for one-handed operation
- **Clean UI**: Intuitive, clutter-free interface

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Yarn package manager
- Expo Go app (for mobile testing)

### Installation

```bash
cd /app/frontend
yarn install
yarn start
```

### First-Time Setup

1. **Configure Tables** (Settings → Table Management)
   - Add table: "1", max seats: 4
   - Add table: "2", max seats: 2
   - Add table: "4-1", max seats: 6

2. **Add Menu Items** (Settings → Menu Items)
   - Chai - ₹10
   - Paratha - ₹40
   - Dal Fry - ₹80

3. **Start Taking Orders** (Running Tables)
   - Tap + to select table
   - Enter number of persons
   - Add items to bill
   - Close when done

## 📋 User Guide

### Creating a Table Order

1. Go to **Running Tables** tab
2. Tap the **+** button
3. Select available table from grid
4. Enter number of persons (validates against available seats)
5. Tap items to add to order
6. Use +/- buttons for quick adjustments
7. Click "Close Table" when ready to bill

### Managing Tables

1. Go to **Settings** tab
2. Tap **Table Management** section
3. Tap + to add new table
4. Enter table name and max seats
5. Tables appear in Running Tables based on availability

### Viewing History

1. Go to **Closed Tables** tab
2. Use date picker to filter by date
3. Tap any closed table to see full bill details

## 🔧 Configuration

### App Branding
- App name: QuikPOS
- Bundle ID (iOS): com.quikpos.app
- Package (Android): com.quikpos.app
- Theme color: #FF6B35

### Storage Keys
- Items: @quikpos_items
- Tables: @quikpos_tables
- Table Masters: @quikpos_table_masters

## 📖 License

Proprietary - All rights reserved

## 🤝 Support

For support and questions, contact your system administrator.

---

**Built with ❤️ for small restaurant owners**
