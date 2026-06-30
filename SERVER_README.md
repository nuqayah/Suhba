# Suhba Backend Integration

This directory contains the integrated backend from QuizVS, adapted for the Suhba Islamic educational platform.

## Backend Features

- **Real-time multiplayer**: WebSocket-based real-time communication
- **Room management**: Create and join rooms for multiplayer games
- **Quiz types**: Support for different Islamic quiz categories
- **Geographic info**: Country flags for players
- **Auto-cleanup**: Automatic room cleanup after 30 minutes

## Setup Instructions

### 1. Install Python Dependencies

```bash
# Install Poetry (if not already installed)
curl -sSL https://install.python-poetry.org | python3 -

# Install dependencies
poetry install
```

### 2. Install Node.js Dependencies

```bash
# Install Node dependencies (includes concurrently for running both frontend and backend)
pnpm install
```

### 3. Development Scripts

```bash
# Run only the backend
pnpm backend:dev

# Run only the frontend
pnpm dev

# Run both frontend and backend simultaneously
pnpm full:dev
```

### 4. Production Scripts

```bash
# Build frontend
pnpm build

# Run backend in production
pnpm backend
```

## Backend API

The backend runs on port 3005 and provides:

### WebSocket Endpoint
- `ws://localhost:3005/api` - Main WebSocket connection

### REST Endpoints
- `GET /` - Health check
- `GET /some_route` - Example endpoint with timestamp

## WebSocket Message Types

### Client to Server:
- `room_open` - Set room open/closed status
- `get_active` - Get list of active rooms
- `join` - Join a room
- `leave` - Leave a room
- `ended` - End game
- `answered` - Player answered question
- `error` - Error handling

### Server to Client:
- `active` - List of active rooms
- `quiz_data` - Quiz questions and data
- `left` - Player left room
- `ended` - Game ended
- `answered` - Player answered
- `error` - Error occurred

## Quiz Types

Currently supported quiz types:
- `ghareeb` - Islamic vocabulary
- `tarteeb_suwar` - Surah ordering
- `maqasid` - Objectives of Surahs
- `makan_nuzul` - Place of revelation

## Integration with Suhba Frontend

The backend is integrated with Suhba's existing game modes:
- **Solo Play**: Existing local gameplay (unchanged)
- **Suhba Mode**: Enhanced with real-time multiplayer capabilities
- **WebSocket Store**: `src/lib/stores/websocket.js` manages backend communication

## Data Files

Quiz data is stored in the `data/` directory:
- `ghareeb.txt` - Vocabulary words
- `maqasid.txt` - Surah objectives
- `quran.txt` - Quran text
- `almuyassar-ghareeb.json` - Structured vocabulary data

## Security Notes

- CORS is configured to allow all origins (development only)
- WebSocket connections include basic geographic detection
- Room codes are generated using secure random strings
- Automatic cleanup prevents resource leaks

## Troubleshooting

1. **WebSocket connection failed**: Ensure backend is running on port 3005
2. **Python dependencies missing**: Run `poetry install`
3. **Port conflicts**: Backend uses port 3005, frontend uses port 5173
4. **Room not found**: Rooms are cleaned up after 30 minutes of inactivity

## Next Steps

1. Connect existing Suhba games to WebSocket backend
2. Implement Islamic quiz types specific to Suhba
3. Add user authentication integration
4. Implement game state synchronization
5. Add mobile-responsive multiplayer UI
