# Let's Shyp - Backend Engineering Intern Assignment

## 🚀 Project Overview

A hyperlocal delivery booking backend system implementing a complete logistics management platform with automated courier movement simulation and intelligent order state progression.

## 📋 Assignment Phases Implemented

### ✅ Phase 1: Order Management
- Order creation with pickup/drop locations, delivery type, and package details
- Strict order state lifecycle: `CREATED` → `ASSIGNED` → `PICKED_UP` → `IN_TRANSIT` → `DELIVERED` → `CANCELLED`
- Order state transition validation and rejection of invalid transitions

### ✅ Phase 2: Courier Management  
- Fixed pool of couriers with unique IDs, names, locations, and availability status
- One courier per active order rule enforcement
- Courier availability tracking and management

### ✅ Phase 3: Auto-Assignment Logic
- Automatic assignment of nearest eligible courier to new orders
- Deterministic Manhattan distance calculation for courier selection
- Express delivery distance threshold enforcement
- Meaningful assignment failure reasons when no courier available

### ✅ Phase 4: Concurrency & Data Safety
- Thread-safe order creation with atomic assignment logic
- Race condition prevention for courier assignments
- Lock-based concurrency control for assignment operations

### ✅ Phase 5: Courier Movement & Order Progression
- Background simulation service for automatic courier movement
- Logical condition-based order state progression
- Manual state jump prevention with strict validation
- Real-time courier movement towards pickup/drop locations

## 🏗️ Architecture

### **Technology Stack**
- **Backend**: Node.js with Express.js
- **Storage**: In-memory data store (as per constraints)
- **Language**: JavaScript (ES6+)
- **Architecture**: Service-oriented with controller pattern

### **Core Components**

#### **Models**
- `Order.js` - Order entity with state management
- `Courier.js` - Courier entity with movement capabilities

#### **Services**
- `OrderService.js` - Order lifecycle management
- `CourierService.js` - Courier operations and location updates
- `AssignmentService.js` - Automatic courier assignment logic
- `MovementSimulationService.js` - Background movement simulation

#### **Controllers**
- `orderController.js` - Order API endpoints
- `courierController.js` - Courier API endpoints  
- `simulationController.js` - Movement simulation control

#### **Utilities**
- `stateValidator.js` - Order state transition rules
- `progressionValidator.js` - Logical progression validation
- `errorHandler.js` - Centralized error handling

#### **Storage**
- `InMemoryStore.js` - Data persistence layer with 10 pre-initialized couriers

## 🛠️ Installation & Setup

### **Prerequisites**
- Node.js (v14+)
- npm or yarn

### **Installation**
```bash
git clone <repository-url>
cd letsshyp
npm install
```

### **Running the Server**
```bash
# Development mode
npm run dev

# Production mode  
npm start
```

Server runs on `http://localhost:5000`

## 📡 API Endpoints

### **Orders**
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get order by ID
- `PATCH /api/orders/:id/state` - Update order state (restricted)
- `DELETE /api/orders/:id` - Cancel order
- `POST /api/orders/:id/progress` - Manual order progression

### **Couriers**
- `GET /api/couriers` - Get all couriers
- `GET /api/couriers/available` - Get available couriers
- `GET /api/couriers/:id` - Get courier by ID
- `PATCH /api/couriers/:id/location` - Update courier location
- `POST /api/couriers/:id/move` - Move courier towards target

### **Simulation (Phase 5)**
- `POST /api/simulation/start` - Start movement simulation
- `POST /api/simulation/stop` - Stop movement simulation
- `GET /api/simulation/status` - Get simulation status
- `PATCH /api/simulation/speed` - Set simulation speed
- `PATCH /api/simulation/step-size` - Set movement step size
- `POST /api/simulation/orders/:id/force-progress` - Force order progression
- `GET /api/simulation/orders/:id/debug` - Debug order state

### **System**
- `GET /api/health` - Health check
- `GET /api/stats` - System statistics
- `GET /` - API documentation

## 🎯 Key Features

### **Intelligent Assignment**
- Nearest courier selection using Manhattan distance
- Express delivery priority handling
- Automatic fallback when no couriers available

### **Movement Simulation**
- Realistic courier movement with configurable speed
- Distance-based state progression triggers
- Background process management

### **State Management**
- Strict order lifecycle enforcement
- Manual state jump prevention
- Logical condition validation for state changes

### **Concurrency Safety**
- Atomic assignment operations
- Race condition prevention
- Lock-based synchronization

## 🧪 Testing

### **Manual Testing (Postman)**
1. Start server: `npm start`
2. Create order using sample data
3. Start simulation: `POST /api/simulation/start`
4. Monitor order progression: `GET /api/orders/:id`
5. Debug state: `GET /api/simulation/orders/:id/debug`

### **Sample Order Data**
```json
{
  "pickupLocation": { "lat": 19.0760, "lng": 72.8777 },
  "dropLocation": { "lat": 19.0896, "lng": 72.8656 },
  "deliveryType": "NORMAL",
  "packageDetails": {
    "weight": 2.5,
    "dimensions": "medium"
  }
}
```

## 🔧 Configuration

### **Default Settings**
- **Server Port**: 5000
- **Simulation Interval**: 2000ms
- **Movement Step Size**: 0.005
- **Distance Threshold**: 0.01
- **Initial Couriers**: 10 (Mumbai locations)

### **Environment Variables**
- `PORT` - Server port (default: 5000)

## 📊 System Design Decisions

### **In-Memory Storage**
- Chosen per assignment constraints
- Fast access for frequent operations
- Simple reset and initialization

### **Manhattan Distance**
- Deterministic and predictable
- Suitable for grid-like urban environments
- Computationally efficient

### **Service Layer Architecture**
- Clear separation of concerns
- Easy testing and maintenance
- Scalable for future enhancements

## 🚀 Future Enhancements

### **Scalability**
1. **Database Integration**: PostgreSQL/MongoDB for persistence
2. **Load Balancing**: Multiple server instances
3. **Caching**: Redis for frequent queries
4. **Message Queue**: RabbitMQ/Kafka for async operations

### **Features**
1. **Real-time Updates**: WebSocket for live tracking
2. **Route Optimization**: Advanced pathfinding algorithms
3. **Multiple Orders**: Couriers handling multiple deliveries
4. **Traffic Simulation**: Variable movement speeds
5. **Analytics**: Delivery performance metrics

### **Infrastructure**
1. **Containerization**: Docker deployment
2. **Monitoring**: Application performance tracking
3. **Logging**: Structured logging system
4. **Testing**: Unit and integration test suites

## 📝 Assignment Requirements Met

### **Core Functional Requirements**
- ✅ Order Management (Phase 1)
- ✅ Courier Management (Phase 2)  
- ✅ Auto-Assignment Logic (Phase 3)
- ✅ Concurrency & Data Safety (Phase 4)
- ✅ Courier Movement & Order Progression (Phase 5)

### **Technical Constraints**
- ✅ Node.js implementation
- ✅ In-memory storage
- ✅ No external APIs/queues
- ✅ Focus on domain logic

### **Deliverables**
- ✅ Source code repository
- ✅ API documentation
- ✅ System design explanation

## 📞 Contact

**Backend Engineering Intern Assignment**  
Implemented by: [Your Name]  
Date: January 2026

---

**🎉 All 5 phases successfully implemented with full functionality!**
