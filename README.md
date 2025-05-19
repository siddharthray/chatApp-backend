WebSocket Chat Server
A robust Express and WebSocket server that provides both HTTP static file serving and real-time WebSocket communication with heartbeat monitoring.
Features

WebSocket Communication: Real-time bi-directional communication using the WebSocket protocol
Express Integration: Serves static files and REST API endpoints from the same server
Heartbeat Mechanism: Automatically detects and cleans up dead connections
Environment Configuration: Flexible configuration via .env file
TypeScript Support: Fully typed for better development experience
CORS Support: Configurable CORS for cross-domain requests
Logging: Built-in request and WebSocket logging

Installation

Clone the repository:

git clone https://github.com/siddharthray/chatApp-backend/tree/socket-testing
cd websocket-chat-server

Install dependencies:

# hnpm install

Create a .env file in the project root based on the example below:

# Server Configuration

PORT=8080
NODE_ENV=development
API_PREFIX=/api
STATIC_DIR=public
WS_HEARTBEAT_INTERVAL=30000
CORS_ORIGIN=\*
LOG_LEVEL=info

Create a public directory in the project root for your static files.

Environment Variables
Port number for the server8080
NODE_ENV Environment mode (development, production)development
API_PREFIX Prefix for API endpoints/api
STATIC_DIR Directory for static files public
WS_HEARTBEAT_INTERVAL Interval in ms for WebSocket heartbeats30000 (30s)
CORS_ORIGIN CORS allowed origins (comma-separated or \*)
LOG_LEVELLog verbosity (debug, info, warn, error)info

Starting the Server

# Development mode with hot reload

npm run dev

# Or using ts-node directly

npx ts-node src/server.ts

# For production (after building)

npm start
WebSocket API
The WebSocket server expects messages in JSON format with the following structure:
typescriptinterface ClientMessage {
type: string;
payload?: any;
}
Supported Message Types

chat: Sends a chat message
json{ "type": "chat", "payload": "Hello, world!" }

Server Responses

welcome: Sent when a client connects
json{ "type": "welcome", "payload": "Welcome to the chat!" }

chatResponse: Response to a chat message
json{ "type": "chatResponse", "payload": "You said: Hello, world!" }

error: Error message
json{ "type": "error", "payload": "Invalid message structure" }

REST API Endpoints

GET /api/health: Health check endpoint
Response: { "status": "ok", "message": "Server is running", "environment": "development", "timestamp": "..." }

Testing WebSocket Connection
Basic Client
The repository includes several test clients to verify different aspects of the WebSocket server:

# Run a basic client

npx ts-node src/client.ts
Test Clients for Heartbeat Validation

To test the heartbeat mechanism and connection management:

# Client with proper disconnection

npx ts-node src/clean-disconnect-client.ts

# Client that abruptly terminates (tests zombie connection detection)

npx ts-node src/zombie-client.ts

# Client that blocks pong responses (tests missed heartbeat detection)

npx ts-node src/pong-blocker.ts

WebSocket Heartbeat Mechanism
The server implements a heartbeat mechanism to detect and clean up dead connections:

Every 30 seconds (configurable), the server sends a ping to each connected client
Clients automatically respond with a pong
If a client misses 3 consecutive pongs, the server logs a warning
If a client misses 5 consecutive pongs, the server terminates the connection

This ensures server resources aren't wasted on dead connections and provides early detection of network issues.
Browser Integration
To connect to the WebSocket server from a browser:
javascript// Create WebSocket connection
const ws = new WebSocket('ws://localhost:8080');

// Connection opened
ws.addEventListener('open', (event) => {
// Send a message
ws.send(JSON.stringify({ type: 'chat', payload: 'Hello Server!' }));
});

// Listen for messages
ws.addEventListener('message', (event) => {
const message = JSON.parse(event.data);
console.log('Message from server:', message);
});

// Connection closed
ws.addEventListener('close', (event) => {
console.log('Connection closed:', event.code, event.reason);
});
Project Structure
websocket-chat-server/
├── src/
│ ├── server.ts # Main server file
│ ├── client.ts # Basic test client
│ ├── clean-disconnect-client.ts # Test client for clean disconnection
│ ├── zombie-client.ts # Test client for abrupt disconnection
│ └── pong-blocker.ts # Test client for heartbeat validation
├── public/ # Static files (HTML, CSS, JS)
├── .env # Environment configuration
├── package.json # Project dependencies
└── README.md # This file
Development
Prerequisites

Node.js 14.0 or higher
npm or yarn

TypeScript Compilation

# Compile TypeScript to JavaScript

npm run build

# Check for TypeScript errors without compiling

npm run check
Production Deployment
For production deployment:

Set appropriate environment variables:
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com

Build the TypeScript files:

# npm run build

Start the server:

# npm start

License
MIT

Author
Siddharth Ray
