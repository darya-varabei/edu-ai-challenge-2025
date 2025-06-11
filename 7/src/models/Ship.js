/**
 * Ship class representing a battleship with locations and hit tracking
 */
export class Ship {
  constructor(length = 3) {
    this.length = length;
    this.locations = [];
    this.hits = new Set();
  }

  /**
   * Place ship on board with given starting position and orientation
   * @param {number} startRow - Starting row position
   * @param {number} startCol - Starting column position
   * @param {string} orientation - 'horizontal' or 'vertical'
   */
  place(startRow, startCol, orientation) {
    this.locations = [];
    this.hits.clear();
    
    for (let i = 0; i < this.length; i++) {
      const row = orientation === 'horizontal' ? startRow : startRow + i;
      const col = orientation === 'horizontal' ? startCol + i : startCol;
      this.locations.push(`${row}${col}`);
    }
  }

  /**
   * Check if a guess hits this ship
   * @param {string} guess - The guess coordinate (e.g., "34")
   * @returns {boolean} True if hit, false otherwise
   */
  checkHit(guess) {
    if (this.locations.includes(guess) && !this.hits.has(guess)) {
      this.hits.add(guess);
      return true;
    }
    return false;
  }

  /**
   * Check if ship is completely sunk
   * @returns {boolean} True if all locations are hit
   */
  isSunk() {
    return this.hits.size === this.length;
  }

  /**
   * Get all ship locations
   * @returns {string[]} Array of coordinate strings
   */
  getLocations() {
    return [...this.locations];
  }

  /**
   * Get all hit locations
   * @returns {string[]} Array of hit coordinate strings
   */
  getHits() {
    return [...this.hits];
  }

  /**
   * Check if a coordinate is part of this ship
   * @param {string} coordinate - The coordinate to check
   * @returns {boolean} True if coordinate is part of ship
   */
  hasLocation(coordinate) {
    return this.locations.includes(coordinate);
  }
} 