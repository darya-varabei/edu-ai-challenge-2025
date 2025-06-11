import { Player } from '../models/Player.js';
import { AIService } from '../services/AIService.js';
import { InputService } from '../services/InputService.js';

/**
 * Game controller class that orchestrates the Sea Battle game
 */
export class Game {
  constructor(config = {}) {
    this.config = {
      boardSize: config.boardSize || 10,
      numberOfShips: config.numberOfShips || 3,
      shipLength: config.shipLength || 3,
      ...config
    };

    this.player = null;
    this.cpu = null;
    this.aiService = null;
    this.inputService = null;
    this.gameState = 'waiting'; // waiting, playing, finished
    this.currentTurn = 'player'; // player, cpu
  }

  /**
   * Initialize the game
   */
  async initialize() {
    this.inputService = new InputService();
    this.inputService.initialize();
    
    this.player = new Player('Human Player', this.config.boardSize);
    this.cpu = new Player('CPU', this.config.boardSize);
    
    this.aiService = new AIService(this.config.boardSize);
    
    // Initialize boards with ships
    this.player.initializeBoard(this.config.numberOfShips, this.config.shipLength);
    this.cpu.initializeBoard(this.config.numberOfShips, this.config.shipLength);
    
    this.gameState = 'playing';
    this.currentTurn = 'player';
  }

  /**
   * Start the game
   */
  async start() {
    await this.initialize();
    this.inputService.displayWelcome();
    
    console.log('Setting up the battlefield...');
    console.log(`Boards created with ${this.config.numberOfShips} ships each.`);
    
    await this.gameLoop();
  }

  /**
   * Main game loop
   */
  async gameLoop() {
    while (this.gameState === 'playing') {
      // Display current game state
      this.displayGameState();
      
      if (this.currentTurn === 'player') {
        await this.handlePlayerTurn();
      } else {
        await this.handleCpuTurn();
      }
      
      // Check win conditions
      if (this.checkGameEnd()) {
        this.gameState = 'finished';
        await this.handleGameEnd();
      }
    }
  }

  /**
   * Handle player's turn
   */
  async handlePlayerTurn() {
    try {
      const coordinate = await this.inputService.getCoordinateGuess();
      
      const guessResult = this.player.makeGuess(coordinate);
      
      if (!guessResult.success) {
        this.inputService.displayError(guessResult.message);
        return; // Stay on player's turn
      }
      
      // Process guess on CPU's board
      const hitResult = this.cpu.receiveGuess(coordinate);
      
      // Update player's view of opponent board
      this.player.updateOpponentBoard(coordinate, hitResult);
      
      // Display result
      if (hitResult.hit) {
        if (hitResult.sunk) {
          this.inputService.displaySuccess(`PLAYER HIT! You sunk an enemy battleship! 🚢`);
        } else {
          this.inputService.displaySuccess('PLAYER HIT! 💥');
        }
      } else {
        this.inputService.display('PLAYER MISS. 🌊');
      }
      
      this.currentTurn = 'cpu';
      
    } catch (error) {
      this.inputService.displayError(`An error occurred: ${error.message}`);
    }
  }

  /**
   * Handle CPU's turn
   */
  async handleCpuTurn() {
    this.inputService.display("\n--- CPU's Turn ---");
    
    // Generate AI move
    const coordinate = this.aiService.generateMove(this.cpu.guesses);
    const guessResult = this.cpu.makeGuess(coordinate);
    
    if (!guessResult.success) {
      // This shouldn't happen with AI, but handle gracefully
      console.error('AI made invalid move:', guessResult.message);
      return;
    }
    
    // Process guess on player's board
    const hitResult = this.player.receiveGuess(coordinate);
    
    // Update CPU's view of opponent board
    this.cpu.updateOpponentBoard(coordinate, hitResult);
    
    // Update AI state
    this.aiService.updateState(coordinate, hitResult);
    
    // Display result
    this.inputService.display(`CPU targets: ${coordinate}`);
    if (hitResult.hit) {
      if (hitResult.sunk) {
        this.inputService.display(`CPU HIT at ${coordinate}! CPU sunk your battleship! 💥🚢`);
      } else {
        this.inputService.display(`CPU HIT at ${coordinate}! 💥`);
      }
    } else {
      this.inputService.display(`CPU MISS at ${coordinate}. 🌊`);
    }
    
    // Brief pause for dramatic effect
    await this.inputService.wait(1500);
    
    this.currentTurn = 'player';
  }

  /**
   * Display current game state
   */
  displayGameState() {
    const playerStats = this.player.getStats();
    const cpuStats = this.cpu.getStats();
    
    this.inputService.displayBoards(
      this.player.getOpponentBoard(),
      this.player.getOwnBoard(),
      this.config.boardSize
    );
    
    this.inputService.displayStats(playerStats, cpuStats);
  }

  /**
   * Check if game has ended
   */
  checkGameEnd() {
    return this.player.hasLost() || this.cpu.hasLost();
  }

  /**
   * Handle game end
   */
  async handleGameEnd() {
    const playerWon = this.cpu.hasLost();
    const playerStats = this.player.getStats();
    const cpuStats = this.cpu.getStats();
    
    // Final board display
    this.displayGameState();
    
    // Display game over message
    this.inputService.displayGameOver(playerWon, playerStats, cpuStats);
    
    // Ask if player wants to play again
    const playAgain = await this.inputService.askPlayAgain();
    
    if (playAgain) {
      await this.restart();
    } else {
      this.inputService.display('Thanks for playing Sea Battle! 👋');
      this.cleanup();
    }
  }

  /**
   * Restart the game
   */
  async restart() {
    this.gameState = 'waiting';
    this.currentTurn = 'player';
    this.aiService.reset();
    
    await this.start();
  }

  /**
   * Clean up resources
   */
  cleanup() {
    if (this.inputService) {
      this.inputService.close();
    }
    this.gameState = 'finished';
  }

  /**
   * Get current game statistics
   */
  getGameStats() {
    if (!this.player || !this.cpu) {
      return null;
    }
    
    return {
      player: this.player.getStats(),
      cpu: this.cpu.getStats(),
      gameState: this.gameState,
      currentTurn: this.currentTurn,
      aiMode: this.aiService ? this.aiService.getMode() : 'unknown'
    };
  }

  /**
   * Set game configuration
   */
  setConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current game configuration
   */
  getConfig() {
    return { ...this.config };
  }
} 