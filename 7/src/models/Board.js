import { Ship } from './Ship.js';

/**
 * Board class representing a game board with ships and tracking guesses
 */
export class Board {
  constructor(size = 10) {
    this.size = size;
    this.ships = [];
    this.guesses = new Set();
    this.grid = this.#initializeGrid();
  }

  /**
   * Initialize empty grid
   * @private
   */
  #initializeGrid() {
    return Array(this.size).fill(null).map(() => 
      Array(this.size).fill('~')
    );
  }

  /**
   * Place ships randomly on the board
   * @param {number} numberOfShips - Number of ships to place
   * @param {number} shipLength - Length of each ship
   */
  placeShipsRandomly(numberOfShips, shipLength = 3) {
    this.ships = [];
    let placedShips = 0;

    while (placedShips < numberOfShips) {
      const ship = new Ship(shipLength);
      const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
      
      const { startRow, startCol } = this.#getRandomStartPosition(shipLength, orientation);
      
      if (this.#canPlaceShip(startRow, startCol, shipLength, orientation)) {
        ship.place(startRow, startCol, orientation);
        this.ships.push(ship);
        this.#updateGridForShip(ship);
        placedShips++;
      }
    }
  }

  /**
   * Get random starting position for ship placement
   * @private
   */
  #getRandomStartPosition(shipLength, orientation) {
    const startRow = orientation === 'horizontal' 
      ? Math.floor(Math.random() * this.size)
      : Math.floor(Math.random() * (this.size - shipLength + 1));
    
    const startCol = orientation === 'horizontal'
      ? Math.floor(Math.random() * (this.size - shipLength + 1))
      : Math.floor(Math.random() * this.size);

    return { startRow, startCol };
  }

  /**
   * Check if ship can be placed at given position
   * @private
   */
  #canPlaceShip(startRow, startCol, shipLength, orientation) {
    for (let i = 0; i < shipLength; i++) {
      const row = orientation === 'horizontal' ? startRow : startRow + i;
      const col = orientation === 'horizontal' ? startCol + i : startCol;
      
      if (row >= this.size || col >= this.size || this.grid[row][col] !== '~') {
        return false;
      }
    }
    return true;
  }

  /**
   * Update grid to show ship placement (for player's own board)
   * @private
   */
  #updateGridForShip(ship) {
    ship.getLocations().forEach(location => {
      const row = parseInt(location[0]);
      const col = parseInt(location[1]);
      this.grid[row][col] = 'S';
    });
  }

  /**
   * Process a guess and return the result
   * @param {string} guess - The coordinate guess (e.g., "34")
   * @returns {Object} Result object with hit, sunk, and alreadyGuessed properties
   */
  processGuess(guess) {
    if (this.guesses.has(guess)) {
      return { hit: false, sunk: false, alreadyGuessed: true };
    }

    this.guesses.add(guess);
    const row = parseInt(guess[0]);
    const col = parseInt(guess[1]);

    // Check if guess hits any ship
    for (const ship of this.ships) {
      if (ship.checkHit(guess)) {
        this.grid[row][col] = 'X';
        return { 
          hit: true, 
          sunk: ship.isSunk(), 
          alreadyGuessed: false,
          ship
        };
      }
    }

    // Miss
    this.grid[row][col] = 'O';
    return { hit: false, sunk: false, alreadyGuessed: false };
  }

  /**
   * Check if all ships are sunk
   * @returns {boolean} True if all ships are sunk
   */
  allShipsSunk() {
    return this.ships.every(ship => ship.isSunk());
  }

  /**
   * Get the current grid state
   * @returns {string[][]} 2D array representing the board
   */
  getGrid() {
    return this.grid.map(row => [...row]);
  }

  /**
   * Get all ships on the board
   * @returns {Ship[]} Array of ship objects
   */
  getShips() {
    return [...this.ships];
  }

  /**
   * Get all guesses made on this board
   * @returns {string[]} Array of guess coordinates
   */
  getGuesses() {
    return [...this.guesses];
  }

  /**
   * Check if a coordinate is valid
   * @param {string} coordinate - The coordinate to validate
   * @returns {boolean} True if coordinate is valid
   */
  isValidCoordinate(coordinate) {
    if (!coordinate || typeof coordinate !== 'string' || coordinate.length !== 2) return false;
    
    const row = parseInt(coordinate[0]);
    const col = parseInt(coordinate[1]);
    
    return !isNaN(row) && !isNaN(col) && 
           row >= 0 && row < this.size && 
           col >= 0 && col < this.size;
  }

  /**
   * Get the number of remaining ships
   * @returns {number} Number of ships not yet sunk
   */
  getRemainingShipsCount() {
    return this.ships.filter(ship => !ship.isSunk()).length;
  }
} 