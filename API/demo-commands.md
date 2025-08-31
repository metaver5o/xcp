# 🚀 Demo Commands for Your Boss

## Quick Start Commands

### 1. Start the Complete Demo
```bash
cd API
./start-demo.sh
```

### 2. Manual Start (Alternative)
```bash
cd API
sudo docker-compose up -d counterparty-api frontend
```

### 3. Check Status
```bash
docker ps
```

### 4. View Logs
```bash
docker-compose logs -f
```

### 5. Stop Services
```bash
docker-compose down
```

## Demo URLs

- **🎨 Frontend**: http://localhost:3000
- **📡 API**: http://localhost:4000
- **🔍 API Health**: http://localhost:4000/health

## Demo Flow for Your Boss

### 1. Show the Professional Interface
- Open http://localhost:3000
- Highlight the banking-style design
- Show the clean, professional layout

### 2. Dashboard Tab
- Real-time system overview
- API health monitoring
- Asset and transaction statistics
- Professional metrics display

### 3. Balances Tab
- View current asset balances
- Search and filter functionality
- Interactive tables
- Asset categorization

### 4. Create Asset Tab
- Generate numeric asset (free)
- Generate named asset (costs 0.5 XCP)
- Add BRC-20 inscription
- Copy transaction hex

### 5. Transactions Tab
- Paste transaction hex
- Broadcast transaction
- Real-time feedback
- Transaction validation

### 6. Settings Tab
- System configuration
- Blockchain state management
- Reset functionality
- Health monitoring

## Key Features to Highlight

✅ **Professional Banking Interface** - Clean, trustworthy design
✅ **Real-time Data Updates** - Live API integration
✅ **Complete Makefile Functionality** - All commands in UI
✅ **BRC-20 Inscription Support** - Modern token standard
✅ **Error Handling** - Robust user experience
✅ **Copy/Paste Functionality** - Easy transaction management
✅ **Responsive Design** - Works on all devices
✅ **TypeScript** - Type-safe development

## Technical Stack

- **React 18** with TypeScript
- **Material-UI (MUI)** for professional components
- **Docker** for containerized deployment
- **Professional banking theme**
- **Real-time API integration**

## Troubleshooting

### If services don't start:
```bash
docker-compose down
sudo docker-compose up -d counterparty-api frontend
```

### If frontend doesn't load:
```bash
docker-compose logs frontend
```

### If API doesn't respond:
```bash
docker-compose logs counterparty-api
```

### Check port conflicts:
```bash
lsof -i :3000
lsof -i :4000
```

## Production Ready Features

- ✅ Docker containerization
- ✅ Environment configuration
- ✅ Health monitoring
- ✅ Error handling
- ✅ Professional UI/UX
- ✅ TypeScript for type safety
- ✅ Material-UI for consistency
- ✅ Responsive design
- ✅ Real-time updates
