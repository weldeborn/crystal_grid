# Crystal Grid - Multiplayer Puzzle Game

A beautiful and engaging multiplayer puzzle game where players compete in real-time to reach 5000 points first! Place Tetris-like pieces on a 10x10 grid, clear lines for points, and unlock new abilities as you play.

## 🎮 Game Features

### Single Player
- **Progressive difficulty**: Choose between Easy and Normal modes
- **Piece variety**: 40+ unique piece variations with rotations and mirrors
- **Strategic gameplay**: Unlock slots (4th, 5th, 6th) for more pieces
- **Power-ups**: Use bombs to clear 3x3 areas
- **Victory condition**: Reach 5000 points to win
- **Game over**: When no moves available and no points for actions

### Multiplayer (1 vs 1)
- **Real-time battles**: Compete against another player live
- **Automatic matchmaking**: Instant pairing with other players
- **Cross-difficulty play**: Easy players can match with Normal players
- **Live opponent view**: See opponent's mini-board and score in real-time
- **First to 5000 wins**: Race your opponent to victory
- **Different piece pools**: Each player gets pieces based on their difficulty setting

## 🚀 Quick Start

### Prerequisites
- **Node.js** (version 14 or higher)
- **Modern web browser** (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone or download the game files**
   ```bash
   # If you have the files locally, navigate to the project directory
   cd /workspace
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   # For development (auto-restart on changes)
   npm run dev

   # For production
   npm start
   ```

4. **Open the game**
   - Open your web browser
   - Navigate to `http://localhost:3001`
   - The game should load automatically

## 🎯 How to Play

### Starting a Game

1. **Choose Game Mode**
   - **Single Player**: Play alone against the computer
   - **1 vs 1**: Find and compete against another player

2. **Select Difficulty**
   - **Easy**: 60% small pieces, 30% medium, 10% large
     - 20% single blocks, 40% small (2-3 blocks), 30% medium (4-5 blocks), 10% large (6+ blocks)
   - **Normal**: Equal probability for all 40+ piece variations

### Multiplayer Matchmaking

1. **Select "1 vs 1" game mode**
2. **Choose your difficulty level**
3. **Wait for opponent** - The game will automatically match you with another player
4. **Game starts automatically** when both players are connected

### Gameplay Mechanics

#### Basic Controls
- **Click and drag** pieces from the side panel to the grid
- **Drop pieces** to place them on the board
- **Preview placement** shows where pieces will land
- **Green preview** = valid placement, **Red preview** = invalid

#### Scoring
- **Clear horizontal lines**: 100 points per line
- **Clear vertical lines**: 100 points per line
- **Multiple lines**: Bonus points (2x, 3x, etc.)
- **Victory**: 5000 points

#### Progression System
- **Start with 3 piece slots**
- **Unlock 4th slot**: 300 points
- **Unlock 5th slot**: 300 points
- **Unlock 6th slot**: 300 points
- **New pieces**: Price doubles with each use (50 → 100 → 200 → 400...)

#### Power-ups
- **Bomb**: 100 points - Clears a 3x3 area randomly on the board

#### Game Over Conditions
- **Single Player**: No moves available + insufficient points for refresh/bomb
- **Multiplayer**: Opponent reaches 5000 points first

## 🏗️ Architecture

### Backend (Node.js + Socket.IO)
- **Express server**: Serves the game files
- **Socket.IO**: Real-time WebSocket communication
- **Matchmaking system**: Automatic player pairing
- **Game rooms**: Handles multiple simultaneous games
- **State synchronization**: Real-time game state updates

### Frontend (HTML5 Canvas + JavaScript)
- **Canvas rendering**: Smooth graphics and animations
- **Drag & drop**: Intuitive piece placement
- **Real-time updates**: Live opponent board and score
- **Responsive UI**: Adapts to different screen sizes
- **Visual effects**: Particle effects and smooth animations

## 📁 Project Structure

```
workspace/
├── puzzle-game.html      # Main game file
├── server.js            # Multiplayer server
├── package.json         # Dependencies and scripts
└── README.md           # This file
```

## 🛠️ Development

### Local Development

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Open multiple browser tabs** to test multiplayer:
   - Open `http://localhost:3001` in tab 1
   - Open `http://localhost:3001` in tab 2
   - Both select "1 vs 1" mode to test matchmaking

### Customization

#### Difficulty Balance
Edit the piece generation probabilities in `puzzle-game.html`:
```javascript
// Easy mode distribution (currently: 20% tiny, 40% small, 30% medium, 10% large)
if (rand < 0.2) availablePieces = tinyPieces;
else if (rand < 0.6) availablePieces = smallPieces;
// ... etc
```

#### Game Balance
- **Grid size**: Change `GRID_SIZE` constant
- **Victory points**: Modify `5000` in victory condition
- **Unlock costs**: Change `300` in slot unlock functions
- **Power-up costs**: Update costs in `usePowerUp` function

## 🐛 Troubleshooting

### Common Issues

#### Server Won't Start
```bash
# Check if port 3001 is available
netstat -an | grep 3001

# Try a different port
PORT=3002 npm start
```

#### Can't Connect to Multiplayer
1. **Check server is running**: Visit `http://localhost:3001`
2. **Open browser console**: Look for WebSocket errors
3. **Try different browser**: Some browsers block WebSockets on `file://`
4. **Check firewall**: Ensure port 3001 isn't blocked

#### Pieces Not Placing
1. **Check drag & drop**: Ensure you're clicking and holding, then dragging
2. **Check preview**: Green preview means valid placement
3. **Try refreshing**: Reload the page to reset the game

#### Multiplayer Issues
- **Need two players**: Open two browser tabs or have a friend join
- **Same game mode**: Both players must select "1 vs 1"
- **Patience**: Wait a few seconds for matchmaking

## 🎮 Strategy Tips

### Single Player
- **Save points**: Keep enough points for emergency refresh
- **Unlock slots**: More piece options = better strategy
- **Plan ahead**: Think about future line completions
- **Use bombs wisely**: Clear difficult areas when stuck

### Multiplayer
- **Balance speed vs quality**: Fast play vs careful placement
- **Watch opponent**: Monitor their score to apply pressure
- **Choose difficulty wisely**: Easy = faster placement, Normal = better pieces
- **Early lead matters**: First to 3000+ points often wins

## 🌟 Features in Detail

### Piece Variety
- **Base pieces**: I, O, T, S, Z, L, J, Single, Small L, Plus
- **Rotations**: 0°, 90°, 180°, 270° variations
- **Mirrors**: Horizontal/vertical mirror versions
- **Total**: 40+ unique piece shapes

### Visual Effects
- **Particle explosions**: Colorful effects when clearing lines
- **Smooth animations**: Piece placement and line clearing animations
- **Visual feedback**: Preview colors, hover effects, score popups
- **Responsive design**: Works on desktop and tablet

### Progression System
- **Strategic unlocking**: Choose when to spend points
- **Dynamic pricing**: Refresh costs double each use
- **Resource management**: Balance spending vs saving

## 🔮 Future Enhancements

- **Ranked multiplayer**: Elo rating system
- **Custom rooms**: Private rooms with codes
- **Spectator mode**: Watch ongoing games
- **More power-ups**: Additional strategic options
- **Tournaments**: Bracket-style competitions
- **Mobile app**: Native iOS/Android versions

## 📄 License

MIT License - Free to use, modify, and distribute

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues, questions, or suggestions:
- Open an issue in the project repository
- Check the troubleshooting section above
- Ensure Node.js is properly installed

---

**Enjoy playing Crystal Grid!** 🎮✨