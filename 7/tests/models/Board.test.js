import { Board } from '../../src/models/Board.js';
import { Ship } from '../../src/models/Ship.js';

describe('Board', () => {
  let board;

  beforeEach(() => {
    board = new Board(10);
  });

  describe('constructor', () => {
    test('should create board with default size 10', () => {
      const defaultBoard = new Board();
      expect(defaultBoard.size).toBe(10);
      expect(defaultBoard.ships).toEqual([]);
      expect(defaultBoard.guesses).toBeInstanceOf(Set);
      expect(defaultBoard.grid).toHaveLength(10);
      expect(defaultBoard.grid[0]).toHaveLength(10);
    });

    test('should create board with custom size', () => {
      const customBoard = new Board(8);
      expect(customBoard.size).toBe(8);
      expect(customBoard.grid).toHaveLength(8);
      expect(customBoard.grid[0]).toHaveLength(8);
    });

    test('should initialize grid with water (~)', () => {
      expect(board.grid[0][0]).toBe('~');
      expect(board.grid[9][9]).toBe('~');
      expect(board.grid[5][5]).toBe('~');
    });
  });

  describe('placeShipsRandomly', () => {
    test('should place correct number of ships', () => {
      board.placeShipsRandomly(3, 3);
      expect(board.ships).toHaveLength(3);
      expect(board.ships[0]).toBeInstanceOf(Ship);
    });

    test('should place ships with correct length', () => {
      board.placeShipsRandomly(2, 4);
      expect(board.ships).toHaveLength(2);
      expect(board.ships[0].length).toBe(4);
      expect(board.ships[1].length).toBe(4);
    });

    test('should mark ship positions on grid', () => {
      board.placeShipsRandomly(1, 3);
      const ship = board.ships[0];
      const locations = ship.getLocations();
      
      locations.forEach(location => {
        const row = parseInt(location[0]);
        const col = parseInt(location[1]);
        expect(board.grid[row][col]).toBe('S');
      });
    });

    test('should not place overlapping ships', () => {
      board.placeShipsRandomly(5, 3);
      const allLocations = [];
      
      board.ships.forEach(ship => {
        ship.getLocations().forEach(location => {
          expect(allLocations).not.toContain(location);
          allLocations.push(location);
        });
      });
    });

    test('should clear previous ships when called again', () => {
      board.placeShipsRandomly(2, 3);
      expect(board.ships).toHaveLength(2);
      
      board.placeShipsRandomly(1, 3);
      expect(board.ships).toHaveLength(1);
    });
  });

  describe('processGuess', () => {
    beforeEach(() => {
      board.placeShipsRandomly(1, 3);
    });

    test('should return alreadyGuessed true for duplicate guess', () => {
      const guess = '55';
      board.processGuess(guess);
      const result = board.processGuess(guess);
      
      expect(result.alreadyGuessed).toBe(true);
      expect(result.hit).toBe(false);
      expect(result.sunk).toBe(false);
    });

    test('should process hit correctly', () => {
      const ship = board.ships[0];
      const shipLocation = ship.getLocations()[0];
      
      const result = board.processGuess(shipLocation);
      
      expect(result.hit).toBe(true);
      expect(result.alreadyGuessed).toBe(false);
      expect(result.ship).toBe(ship);
      
      const row = parseInt(shipLocation[0]);
      const col = parseInt(shipLocation[1]);
      expect(board.grid[row][col]).toBe('X');
    });

    test('should process miss correctly', () => {
      // Find empty location
      let emptyLocation = null;
      for (let row = 0; row < board.size; row++) {
        for (let col = 0; col < board.size; col++) {
          if (board.grid[row][col] === '~') {
            emptyLocation = `${row}${col}`;
            break;
          }
        }
        if (emptyLocation) break;
      }
      
      const result = board.processGuess(emptyLocation);
      
      expect(result.hit).toBe(false);
      expect(result.sunk).toBe(false);
      expect(result.alreadyGuessed).toBe(false);
      
      const row = parseInt(emptyLocation[0]);
      const col = parseInt(emptyLocation[1]);
      expect(board.grid[row][col]).toBe('O');
    });

    test('should detect sunk ship', () => {
      const ship = board.ships[0];
      const locations = ship.getLocations();
      
      // Hit all locations except last
      for (let i = 0; i < locations.length - 1; i++) {
        const result = board.processGuess(locations[i]);
        expect(result.sunk).toBe(false);
      }
      
      // Hit last location
      const finalResult = board.processGuess(locations[locations.length - 1]);
      expect(finalResult.sunk).toBe(true);
      expect(finalResult.hit).toBe(true);
    });

    test('should add guess to guesses set', () => {
      const guess = '44';
      board.processGuess(guess);
      expect(board.guesses.has(guess)).toBe(true);
    });
  });

  describe('allShipsSunk', () => {
    beforeEach(() => {
      board.placeShipsRandomly(2, 2);
    });

    test('should return false when ships are not sunk', () => {
      expect(board.allShipsSunk()).toBe(false);
    });

    test('should return false when some ships are sunk', () => {
      const firstShip = board.ships[0];
      const locations = firstShip.getLocations();
      
      // Sink first ship
      locations.forEach(location => {
        board.processGuess(location);
      });
      
      expect(board.allShipsSunk()).toBe(false);
    });

    test('should return true when all ships are sunk', () => {
      board.ships.forEach(ship => {
        ship.getLocations().forEach(location => {
          board.processGuess(location);
        });
      });
      
      expect(board.allShipsSunk()).toBe(true);
    });
  });

  describe('getGrid', () => {
    test('should return copy of grid', () => {
      const grid = board.getGrid();
      expect(grid).toEqual(board.grid);
      
      // Modifying returned grid shouldn't affect original
      grid[0][0] = 'X';
      expect(board.grid[0][0]).toBe('~');
    });
  });

  describe('getShips', () => {
    test('should return copy of ships array', () => {
      board.placeShipsRandomly(2, 3);
      const ships = board.getShips();
      expect(ships).toHaveLength(2);
      
      // Modifying returned ships shouldn't affect original
      ships.push(new Ship(3));
      expect(board.ships).toHaveLength(2);
    });
  });

  describe('getGuesses', () => {
    test('should return array of guesses', () => {
      board.processGuess('11');
      board.processGuess('22');
      
      const guesses = board.getGuesses();
      expect(guesses).toContain('11');
      expect(guesses).toContain('22');
      expect(guesses).toHaveLength(2);
    });

    test('should return copy of guesses', () => {
      board.processGuess('33');
      const guesses = board.getGuesses();
      guesses.push('44');
      
      expect(board.guesses.has('44')).toBe(false);
    });
  });

  describe('isValidCoordinate', () => {
    test('should return true for valid coordinates', () => {
      expect(board.isValidCoordinate('00')).toBe(true);
      expect(board.isValidCoordinate('99')).toBe(true);
      expect(board.isValidCoordinate('55')).toBe(true);
    });

    test('should return false for invalid coordinates', () => {
      expect(board.isValidCoordinate('AB')).toBe(false);
      expect(board.isValidCoordinate('1')).toBe(false);
      expect(board.isValidCoordinate('123')).toBe(false);
      expect(board.isValidCoordinate('')).toBe(false);
    });

    test('should return false for out of bounds coordinates', () => {
      expect(board.isValidCoordinate('AA')).toBe(false); // row 10 (A=10) is out of bounds for size 10
      expect(board.isValidCoordinate('9A')).toBe(false); // col 10 (A=10) is out of bounds
      expect(board.isValidCoordinate('AB')).toBe(false);
    });
  });

  describe('getRemainingShipsCount', () => {
    beforeEach(() => {
      board.placeShipsRandomly(3, 2);
    });

    test('should return total ships when none are sunk', () => {
      expect(board.getRemainingShipsCount()).toBe(3);
    });

    test('should return correct count after sinking ships', () => {
      const firstShip = board.ships[0];
      firstShip.getLocations().forEach(location => {
        board.processGuess(location);
      });
      
      expect(board.getRemainingShipsCount()).toBe(2);
    });

    test('should return 0 when all ships are sunk', () => {
      board.ships.forEach(ship => {
        ship.getLocations().forEach(location => {
          board.processGuess(location);
        });
      });
      
      expect(board.getRemainingShipsCount()).toBe(0);
    });
  });

  describe('edge cases', () => {
    test('should handle small board size', () => {
      const smallBoard = new Board(3);
      smallBoard.placeShipsRandomly(1, 2);
      
      expect(smallBoard.ships).toHaveLength(1);
      expect(smallBoard.ships[0].length).toBe(2);
    });

    test('should handle single cell ship', () => {
      board.placeShipsRandomly(1, 1);
      const ship = board.ships[0];
      const location = ship.getLocations()[0];
      
      const result = board.processGuess(location);
      expect(result.hit).toBe(true);
      expect(result.sunk).toBe(true);
    });

    test('should handle maximum ships for board size', () => {
      // For a 10x10 board, we should be able to place many ships
      board.placeShipsRandomly(10, 2);
      expect(board.ships.length).toBeGreaterThan(0);
      expect(board.ships.length).toBeLessThanOrEqual(10);
    });
  });
}); 