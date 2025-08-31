# Counterparty Asset Management Frontend

A modern, professional React frontend for managing Counterparty assets with BRC-20 inscriptions.

## Features

### 🏦 Banking-Style Interface
- Clean, professional design with banking aesthetics
- Modern Material-UI components
- Responsive layout for all devices
- Professional color scheme and typography

### 📊 Dashboard
- Real-time system overview
- API health monitoring
- Asset and transaction statistics
- Quick status indicators

### 💰 Balance Management
- View all asset balances
- Search and filter functionality
- Interactive balance tables
- Asset type categorization

### 🎯 Asset Creation
- Create numeric and named assets
- BRC-20 inscription support
- Asset type validation
- Transaction generation

### 📡 Transaction Broadcasting
- Broadcast signed transactions
- Transaction validation
- Copy/paste functionality
- Real-time feedback

### ⚙️ System Settings
- API configuration display
- Blockchain state management
- System reset functionality
- Health monitoring

## Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Counterparty API running on port 4000

### Installation
```bash
cd frontend
npm install
```

### Development
```bash
npm start
```

The app will open at http://localhost:3000

### Production Build
```bash
npm run build
```

## API Integration

The frontend connects to the Counterparty API running on `http://localhost:4000` with:
- **Username**: `local`
- **Password**: `localpass`
- **Network**: `regtest`

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## Technology Stack

- **React 18** with TypeScript
- **Material-UI (MUI)** for components
- **Axios** for API communication
- **React Router** for navigation
- **Emotion** for styling

## Demo Commands for Your Boss

### 1. Start the Demo
```bash
cd API
./start-demo.sh
```

### 2. Show API Health
- Open http://localhost:4000/health
- Shows API status and network info

### 3. Demonstrate Frontend Features
- **Dashboard**: Real-time system overview
- **Balances**: View and search asset balances
- **Create Asset**: Generate new assets with BRC-20 inscriptions
- **Transactions**: Broadcast signed transactions
- **Settings**: System management and reset

### 4. Test Asset Creation
1. Go to "Create Asset" tab
2. Generate a numeric asset (free)
3. Add BRC-20 inscription
4. Create transaction
5. Copy transaction hex
6. Go to "Transactions" tab
7. Paste and broadcast transaction
8. Check "Balances" tab to see new asset

### 5. Show Professional Features
- Clean, banking-style interface
- Real-time data updates
- Error handling and validation
- Copy/paste functionality
- Responsive design
- Professional color scheme

## Architecture

```
src/
├── components/          # React components
│   ├── MainTabs.tsx    # Main navigation
│   ├── Dashboard.tsx   # System overview
│   ├── Balances.tsx    # Balance management
│   ├── AssetCreation.tsx # Asset creation
│   ├── Transactions.tsx # Transaction broadcasting
│   └── Settings.tsx    # System settings
├── services/
│   └── api.ts          # API integration
└── App.tsx             # Main app component
```

## Customization

### Theme Colors
Edit `src/App.tsx` to customize the theme:
- Primary: Deep blue (#1e3a8a)
- Secondary: Emerald green (#059669)
- Background: Light gray (#f8fafc)

### API Configuration
Update `src/services/api.ts` to change:
- API URL
- Authentication credentials
- Request/response handling

## Production Deployment

1. Build the app: `npm run build`
2. Serve the `build` folder with any static server
3. Ensure the Counterparty API is accessible
4. Update API URL in production environment

## Support

For issues or questions:
1. Check the API is running on port 4000
2. Verify authentication credentials
3. Check browser console for errors
4. Ensure all dependencies are installed