# Chat App Backend - Project Structure

## 📁 Directory Structure

src/
├── server.ts # Main entry point (slim)
├── config/
│ ├── environment.ts # Environment variables
│ ├── cors.ts # CORS configuration
│ └── morgan.ts # Morgan logging setup
├── middleware/
│ ├── errorHandler.ts # Error handling middleware
│ ├── notFoundHandler.ts # 404 handler
│ └── index.ts # Export all middleware
├── routes/
│ ├── api.ts # API routes (/api/\*)
│ ├── static.ts # Static file routes
│ └── index.ts # Route aggregator
├── websocket/
│ ├── socketio.ts # Socket.IO setup
│ ├── nativeWs.ts # Native WebSocket setup
│ └── index.ts # WebSocket aggregator
├── utils/
│ ├── gracefulShutdown.ts # Shutdown handling
│ └── processHandlers.ts # Process event handlers
└── types/
└── index.ts # Type definitions

## 🎯 Module Descriptions

### **📄 Core**

- **`server.ts`** - Main application entry point, orchestrates all modules

### **⚙️ Configuration (`config/`)**

- **`environment.ts`** - Centralized environment variable management
- **`cors.ts`** - Cross-Origin Resource Sharing configuration
- **`morgan.ts`** - HTTP request logging middleware setup

### **🛡️ Middleware (`middleware/`)**

- **`errorHandler.ts`** - Global error handling and formatting
- **`notFoundHandler.ts`** - 404 error handling with noise filtering
- **`index.ts`** - Middleware exports aggregator

### **🛣️ Routes (`routes/`)**

- **`api.ts`** - RESTful API endpoints (health checks, etc.)
- **`static.ts`** - Static file serving routes
- **`index.ts`** - Route setup and organization

### **🔌 WebSocket (`websocket/`)**

- **`socketio.ts`** - Socket.IO real-time communication setup
- **`nativeWs.ts`** - Native WebSocket protocol implementation
- **`index.ts`** - WebSocket services aggregator

### **🔧 Utilities (`utils/`)**

- **`gracefulShutdown.ts`** - Clean application shutdown handling
- **`processHandlers.ts`** - Uncaught exception and rejection handling

### **📝 Types (`types/`)**

- **`index.ts`** - TypeScript type definitions and interfaces

## 🚀 Architecture Benefits

### **Separation of Concerns**

- Each module has a single, well-defined responsibility
- Easy to locate and modify specific functionality
- Reduced coupling between different parts of the application

### **Maintainability**

- Clear file organization makes navigation intuitive
- Consistent naming conventions across modules
- Modular structure supports team collaboration

### **Scalability**

- Easy to add new features without affecting existing code
- Clean import/export structure supports dependency management
- Modular design enables feature-based development

### **Testability**

- Individual modules can be unit tested in isolation
- Clear interfaces make mocking dependencies straightforward
- Separation enables focused integration testing

## 📦 Key Features

- **✅ TypeScript** - Full type safety with modern ES modules
- **✅ Express.js** - Robust HTTP server with middleware support
- **✅ Dual WebSocket** - Both Socket.IO and native WebSocket support
- **✅ Error Handling** - Comprehensive error management with logging
- **✅ Environment Config** - Flexible configuration management
- **✅ Process Management** - Graceful shutdown and error recovery
- **✅ Development Tools** - Morgan logging and development utilities

## 🛠️ Development Workflow

1. **Configuration** - Environment and service setup
2. **Middleware** - Request processing and error handling
3. **Routes** - API endpoints and static file serving
4. **WebSocket** - Real-time communication setup
5. **Error Handling** - Comprehensive error management
6. **Process Management** - Graceful lifecycle management

This modular architecture ensures a maintainable, scalable, and robust chat application backend.
