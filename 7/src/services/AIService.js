/**
 * AIService class handling CPU player logic with hunt and target modes
 */
export class AIService {
  constructor(boardSize = 10) {
    this.boardSize = boardSize;
    this.mode = 'hunt';
    this.targetQueue = [];
    this.previousHits = [];
  }

  /**
   * Generate the next AI move based on current mode
   * @param {Set} previousGuesses - Set of previously made guesses
   * @returns {string} The coordinate to guess next
   */
  generateMove(previousGuesses) {
    let coordinate;

    if (this.mode === 'target' && this.targetQueue.length > 0) {
      coordinate = this.#getTargetModeMove(previousGuesses);
    } else {
      coordinate = this.#getHuntModeMove(previousGuesses);
    }

    return coordinate;
  }

  /**
   * Update AI state based on the result of the last move
   * @param {string} coordinate - The coordinate that was guessed
   * @param {Object} result - The result of the guess
   */
  updateState(coordinate, result) {
    if (result.hit) {
      this.previousHits.push(coordinate);
      
      if (result.sunk) {
        // Ship sunk, return to hunt mode
        this.mode = 'hunt';
        this.targetQueue = [];
        this.#removeDeadTargets(result.ship);
      } else {
        // Hit but not sunk, switch to target mode
        this.mode = 'target';
        this.#addAdjacentTargets(coordinate);
      }
    } else {
      // Miss - remove from target queue if in target mode
      if (this.mode === 'target') {
        this.#removeFromTargetQueue(coordinate);
        if (this.targetQueue.length === 0) {
          this.mode = 'hunt';
        }
      }
    }
  }

  /**
   * Get move in hunt mode (random search)
   * @private
   */
  #getHuntModeMove(previousGuesses) {
    let coordinate;
    let attempts = 0;
    const maxAttempts = this.boardSize * this.boardSize;

    do {
      const row = Math.floor(Math.random() * this.boardSize);
      const col = Math.floor(Math.random() * this.boardSize);
      coordinate = `${row}${col}`;
      attempts++;
    } while (previousGuesses.has(coordinate) && attempts < maxAttempts);

    return coordinate;
  }

  /**
   * Get move in target mode (systematic search around hits)
   * @private
   */
  #getTargetModeMove(previousGuesses) {
    // Try targets in queue first
    while (this.targetQueue.length > 0) {
      const coordinate = this.targetQueue.shift();
      if (!previousGuesses.has(coordinate)) {
        return coordinate;
      }
    }

    // If no valid targets, switch back to hunt mode
    this.mode = 'hunt';
    return this.#getHuntModeMove(previousGuesses);
  }

  /**
   * Add adjacent coordinates to target queue
   * @private
   */
  #addAdjacentTargets(coordinate) {
    const row = parseInt(coordinate[0]);
    const col = parseInt(coordinate[1]);

    const adjacentCoordinates = [
      { r: row - 1, c: col },     // North
      { r: row + 1, c: col },     // South
      { r: row, c: col - 1 },     // West
      { r: row, c: col + 1 }      // East
    ];

    adjacentCoordinates.forEach(({ r, c }) => {
      if (this.#isValidCoordinate(r, c)) {
        const adjCoordinate = `${r}${c}`;
        if (!this.targetQueue.includes(adjCoordinate)) {
          this.targetQueue.push(adjCoordinate);
        }
      }
    });

    // If we have multiple hits, prioritize coordinates in line with previous hits
    if (this.previousHits.length > 1) {
      this.#prioritizeLinearTargets();
    }
  }

  /**
   * Prioritize targets that are in line with previous hits
   * @private
   */
  #prioritizeLinearTargets() {
    if (this.previousHits.length < 2) return;

    const lastHit = this.previousHits[this.previousHits.length - 1];
    const secondLastHit = this.previousHits[this.previousHits.length - 2];

    const lastRow = parseInt(lastHit[0]);
    const lastCol = parseInt(lastHit[1]);
    const secondLastRow = parseInt(secondLastHit[0]);
    const secondLastCol = parseInt(secondLastHit[1]);

    // Determine direction (horizontal or vertical)
    const isHorizontal = lastRow === secondLastRow;
    const isVertical = lastCol === secondLastCol;

    if (isHorizontal || isVertical) {
      // Reorder target queue to prioritize continuation of the line
      const priorityTargets = [];
      const regularTargets = [];

      this.targetQueue.forEach(target => {
        const targetRow = parseInt(target[0]);
        const targetCol = parseInt(target[1]);

        if (isHorizontal && targetRow === lastRow) {
          priorityTargets.push(target);
        } else if (isVertical && targetCol === lastCol) {
          priorityTargets.push(target);
        } else {
          regularTargets.push(target);
        }
      });

      this.targetQueue = [...priorityTargets, ...regularTargets];
    }
  }

  /**
   * Remove targets that are no longer relevant after sinking a ship
   * @private
   */
  #removeDeadTargets(ship) {
    if (!ship) return;

    const shipLocations = ship.getLocations();
    
    // Remove any targets that were adjacent to the sunk ship
    this.targetQueue = this.targetQueue.filter(target => {
      return !this.#isAdjacentToAnyLocation(target, shipLocations);
    });

    // Clear previous hits for the sunk ship
    this.previousHits = this.previousHits.filter(hit => {
      return !shipLocations.includes(hit);
    });
  }

  /**
   * Check if a target is adjacent to any of the given locations
   * @private
   */
  #isAdjacentToAnyLocation(target, locations) {
    const targetRow = parseInt(target[0]);
    const targetCol = parseInt(target[1]);

    return locations.some(location => {
      const locRow = parseInt(location[0]);
      const locCol = parseInt(location[1]);
      
      const rowDiff = Math.abs(targetRow - locRow);
      const colDiff = Math.abs(targetCol - locCol);
      
      return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    });
  }

  /**
   * Remove coordinate from target queue
   * @private
   */
  #removeFromTargetQueue(coordinate) {
    const index = this.targetQueue.indexOf(coordinate);
    if (index > -1) {
      this.targetQueue.splice(index, 1);
    }
  }

  /**
   * Check if coordinate is within board bounds
   * @private
   */
  #isValidCoordinate(row, col) {
    return row >= 0 && row < this.boardSize && col >= 0 && col < this.boardSize;
  }

  /**
   * Get current AI mode
   * @returns {string} Current mode ('hunt' or 'target')
   */
  getMode() {
    return this.mode;
  }

  /**
   * Get current target queue
   * @returns {string[]} Array of target coordinates
   */
  getTargetQueue() {
    return [...this.targetQueue];
  }

  /**
   * Reset AI state
   */
  reset() {
    this.mode = 'hunt';
    this.targetQueue = [];
    this.previousHits = [];
  }
} 