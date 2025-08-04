# Real-time Chat Application

## Tech Stack

- **Backend:** Node.js with WebSocket (ws library)
- **Frontend:** Vue.js 3 with Vite
- **Real-time Communication:** WebSockets

## Prerequisites

Before running this project, make sure you have the following installed on your machine:

- **Node.js** (version 22.x or higher)
- **npm** (comes with Node.js)

You can check your Node.js version by running:
```bash
node --version
npm --version
```

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/nadirbakri/real-time-chat.git
   cd real-time-chat
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

## Running the Application

### Development Mode

1. **Start the WebSocket server:**
   ```bash
   npm run dev
   ```
   This will start the server using nodemon, which automatically restarts when files change.

2. **In a new terminal, start the frontend development server:**
   ```bash
   npm run build
   ```
   Note: If you have a separate frontend setup, you might need to run Vite separately.

### Production Mode

1. **Start the server:**
   ```bash
   npm start
   ```

## Usage

1. Open your web browser and navigate to the application URL (`http://localhost:3000`)
2. Enter your name
3. Start chatting
