import { Board } from './Board.js';

/**
 * Player class representing a game player with their own board
 */
export class Player {
  constructor(name, boardSize = 10) {
    this.name = name;
    this.board = new Board(boardSize);
    this.opponentBoard = new Board(boardSize);
    this.guesses = new Set();
  }

  /**
   * Initialize player's board with ships
   * @param {number} numberOfShips - Number of ships to place
   * @param {number} shipLength - Length of each ship
   */
  initializeBoard(numberOfShips, shipLength) {
    this.board.placeShipsRandomly(numberOfShips, shipLength);
  }

  /**
   * Make a guess on the opponent's board
   * @param {string} coordinate - The coordinate to guess
   * @returns {Object} Result of the guess
   */
  makeGuess(coordinate) {
    if (this.guesses.has(coordinate)) {
      return { 
        success: false, 
        message: 'You already guessed that location!',
        alreadyGuessed: true
      };
    }

    if (!this.board.isValidCoordinate(coordinate)) {
      return { 
        success: false, 
        message: 'Invalid coordinate format. Use format like "34" or "07".',
        invalid: true
      };
    }

    this.guesses.add(coordinate);
    return { success: true, coordinate };
  }

  /**
   * Receive a guess from opponent on this player's board
   * @param {string} coordinate - The coordinate being guessed
   * @returns {Object} Result of the guess
   */
  receiveGuess(coordinate) {
    return this.board.processGuess(coordinate);
  }

  /**
   * Update the opponent board based on guess result
   * @param {string} coordinate - The coordinate that was guessed
   * @param {Object} result - The result of the guess
   */
  updateOpponentBoard(coordinate, result) {
    const row = parseInt(coordinate[0]);
    const col = parseInt(coordinate[1]);
    const grid = this.opponentBoard.getGrid();
    
    if (result.hit) {
      grid[row][col] = 'X';
    } else {
      grid[row][col] = 'O';
    }
    
    this.opponentBoard.grid = grid;
  }

  /**
   * Check if player has won (all opponent's ships sunk)
   * @returns {boolean} True if player has won
   */
  hasWon() {
    return this.board.allShipsSunk();
  }

  /**
   * Check if player has lost (all own ships sunk)
   * @returns {boolean} True if player has lost
   */
  hasLost() {
    return this.board.allShipsSunk();
  }

  /**
   * Get the player's board grid
   * @returns {string[][]} 2D array representing player's board
   */
  getOwnBoard() {
    return this.board.getGrid();
  }

  /**
   * Get the opponent's board grid (with guesses marked)
   * @returns {string[][]} 2D array representing opponent's board view
   */
  getOpponentBoard() {
    return this.opponentBoard.getGrid();
  }

  /**
   * Get remaining ships count
   * @returns {number} Number of remaining ships
   */
  getRemainingShips() {
    return this.board.getRemainingShipsCount();
  }

  /**
   * Get all guesses made by this player
   * @returns {string[]} Array of guess coordinates
   */
  getGuesses() {
    return [...this.guesses];
  }

  /**
   * Get player statistics
   * @returns {Object} Statistics object
   */
  getStats() {
    const totalGuesses = this.guesses.size;
    const hits = this.getOpponentBoard()
      .flat()
      .filter(cell => cell === 'X').length;
    
    return {
      name: this.name,
      totalGuesses,
      hits,
      misses: totalGuesses - hits,
      remainingShips: this.getRemainingShips(),
      accuracy: totalGuesses > 0 ? ((hits / totalGuesses) * 100).toFixed(1) : '0.0'
    };
  }
} 