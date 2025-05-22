src/
├── server.ts # Main entry point (slim)
├── config/
│ ├── environment.ts # Environment variables
│ ├── cors.ts # CORS configuration
│ └── morgan.ts # Morgan logging setup
├── middleware/
│ ├── errorHandler.ts # Error handling middleware
│ ├── notFound.ts # 404 handler
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
