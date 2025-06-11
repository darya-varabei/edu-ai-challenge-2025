import { Player } from '../../src/models/Player.js';
import { Board } from '../../src/models/Board.js';

describe('Player', () => {
  let player;

  beforeEach(() => {
    player = new Player('TestPlayer', 10);
  });

  describe('constructor', () => {
    test('should create player with name and board', () => {
      expect(player.name).toBe('TestPlayer');
      expect(player.board).toBeInstanceOf(Board);
      expect(player.opponentBoard).toBeInstanceOf(Board);
      expect(player.guesses).toBeInstanceOf(Set);
      expect(player.guesses.size).toBe(0);
    });

    test('should create player with default board size', () => {
      const defaultPlayer = new Player('Default');
      expect(defaultPlayer.board.size).toBe(10);
      expect(defaultPlayer.opponentBoard.size).toBe(10);
    });

    test('should create player with custom board size', () => {
      const customPlayer = new Player('Custom', 8);
      expect(customPlayer.board.size).toBe(8);
      expect(customPlayer.opponentBoard.size).toBe(8);
    });
  });

  describe('initializeBoard', () => {
    test('should initialize board with ships', () => {
      player.initializeBoard(3, 3);
      expect(player.board.ships).toHaveLength(3);
      expect(player.board.ships[0].length).toBe(3);
    });

    test('should initialize board with custom parameters', () => {
      player.initializeBoard(2, 4);
      expect(player.board.ships).toHaveLength(2);
      expect(player.board.ships[0].length).toBe(4);
    });
  });

  describe('makeGuess', () => {
    test('should accept valid guess', () => {
      const result = player.makeGuess('34');
      expect(result.success).toBe(true);
      expect(result.coordinate).toBe('34');
      expect(player.guesses.has('34')).toBe(true);
    });

    test('should reject duplicate guess', () => {
      player.makeGuess('34');
      const result = player.makeGuess('34');
      
      expect(result.success).toBe(false);
      expect(result.alreadyGuessed).toBe(true);
      expect(result.message).toContain('already guessed');
    });

    test('should reject invalid coordinate format', () => {
      const result = player.makeGuess('ABC');
      expect(result.success).toBe(false);
      expect(result.invalid).toBe(true);
      expect(result.message).toContain('Invalid coordinate');
    });

    test('should reject out of bounds coordinate', () => {
      const result = player.makeGuess('99'); // Assuming 10x10 board, 99 is valid
      expect(result.success).toBe(true);
      
      const outOfBounds = player.makeGuess('AA');
      expect(outOfBounds.success).toBe(false);
    });

    test('should track multiple guesses', () => {
      player.makeGuess('11');
      player.makeGuess('22');
      player.makeGuess('33');
      
      expect(player.guesses.size).toBe(3);
      expect(player.guesses.has('11')).toBe(true);
      expect(player.guesses.has('22')).toBe(true);
      expect(player.guesses.has('33')).toBe(true);
    });
  });

  describe('receiveGuess', () => {
    beforeEach(() => {
      player.initializeBoard(1, 3);
    });

    test('should process guess on own board', () => {
      const ship = player.board.ships[0];
      const shipLocation = ship.getLocations()[0];
      
      const result = player.receiveGuess(shipLocation);
      
      expect(result.hit).toBe(true);
      expect(result.ship).toBe(ship);
    });

    test('should process miss on own board', () => {
      // Find empty location
      let emptyLocation = null;
      for (let row = 0; row < player.board.size; row++) {
        for (let col = 0; col < player.board.size; col++) {
          if (player.board.grid[row][col] === '~') {
            emptyLocation = `${row}${col}`;
            break;
          }
        }
        if (emptyLocation) break;
      }
      
      const result = player.receiveGuess(emptyLocation);
      expect(result.hit).toBe(false);
      expect(result.sunk).toBe(false);
    });
  });

  describe('updateOpponentBoard', () => {
    test('should update opponent board with hit', () => {
      const coordinate = '45';
      const result = { hit: true, sunk: false };
      
      player.updateOpponentBoard(coordinate, result);
      
      const opponentGrid = player.getOpponentBoard();
      expect(opponentGrid[4][5]).toBe('X');
    });

    test('should update opponent board with miss', () => {
      const coordinate = '23';
      const result = { hit: false, sunk: false };
      
      player.updateOpponentBoard(coordinate, result);
      
      const opponentGrid = player.getOpponentBoard();
      expect(opponentGrid[2][3]).toBe('O');
    });
  });

  describe('hasWon', () => {
    test('should return false when own ships are not sunk', () => {
      player.initializeBoard(1, 3);
      expect(player.hasWon()).toBe(false);
    });

    test('should return true when own ships are all sunk', () => {
      player.initializeBoard(1, 3);
      const ship = player.board.ships[0];
      
      // Sink all ships
      ship.getLocations().forEach(location => {
        player.board.processGuess(location);
      });
      
      expect(player.hasWon()).toBe(true);
    });
  });

  describe('hasLost', () => {
    test('should return false when own ships are not sunk', () => {
      player.initializeBoard(1, 3);
      expect(player.hasLost()).toBe(false);
    });

    test('should return true when own ships are all sunk', () => {
      player.initializeBoard(1, 3);
      const ship = player.board.ships[0];
      
      // Sink all ships
      ship.getLocations().forEach(location => {
        player.board.processGuess(location);
      });
      
      expect(player.hasLost()).toBe(true);
    });
  });

  describe('getOwnBoard', () => {
    test('should return own board grid', () => {
      player.initializeBoard(1, 3);
      const ownBoard = player.getOwnBoard();
      
      expect(ownBoard).toHaveLength(10);
      expect(ownBoard[0]).toHaveLength(10);
      
      // Should contain ship markers
      const flatBoard = ownBoard.flat();
      expect(flatBoard).toContain('S');
    });

    test('should return copy of grid', () => {
      const ownBoard = player.getOwnBoard();
      ownBoard[0][0] = 'X';
      
      const secondGet = player.getOwnBoard();
      expect(secondGet[0][0]).toBe('~');
    });
  });

  describe('getOpponentBoard', () => {
    test('should return opponent board view', () => {
      const opponentBoard = player.getOpponentBoard();
      
      expect(opponentBoard).toHaveLength(10);
      expect(opponentBoard[0]).toHaveLength(10);
      
      // Should be all water initially
      const flatBoard = opponentBoard.flat();
      expect(flatBoard.every(cell => cell === '~')).toBe(true);
    });
  });

  describe('getRemainingShips', () => {
    test('should return correct remaining ships count', () => {
      player.initializeBoard(3, 3);
      expect(player.getRemainingShips()).toBe(3);
      
      // Sink one ship
      const ship = player.board.ships[0];
      ship.getLocations().forEach(location => {
        player.board.processGuess(location);
      });
      
      expect(player.getRemainingShips()).toBe(2);
    });
  });

  describe('getGuesses', () => {
    test('should return array of guesses', () => {
      player.makeGuess('11');
      player.makeGuess('22');
      
      const guesses = player.getGuesses();
      expect(guesses).toContain('11');
      expect(guesses).toContain('22');
      expect(guesses).toHaveLength(2);
    });

    test('should return copy of guesses', () => {
      player.makeGuess('33');
      const guesses = player.getGuesses();
      guesses.push('44');
      
      expect(player.guesses.has('44')).toBe(false);
    });
  });

  describe('getStats', () => {
    beforeEach(() => {
      player.initializeBoard(2, 3);
    });

    test('should return correct statistics', () => {
      // Make some guesses and mark results
      player.makeGuess('11');
      player.makeGuess('22');
      player.makeGuess('33');
      
      // Simulate hits and misses on opponent board
      player.updateOpponentBoard('11', { hit: true });
      player.updateOpponentBoard('22', { hit: false });
      player.updateOpponentBoard('33', { hit: true });
      
      const stats = player.getStats();
      
      expect(stats.name).toBe('TestPlayer');
      expect(stats.totalGuesses).toBe(3);
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(1);
      expect(stats.remainingShips).toBe(2);
      expect(stats.accuracy).toBe('66.7');
    });

    test('should handle zero guesses', () => {
      const stats = player.getStats();
      
      expect(stats.totalGuesses).toBe(0);
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
      expect(stats.accuracy).toBe('0.0');
    });

    test('should update remaining ships after sinking', () => {
      const ship = player.board.ships[0];
      ship.getLocations().forEach(location => {
        player.board.processGuess(location);
      });
      
      const stats = player.getStats();
      expect(stats.remainingShips).toBe(1);
    });
  });

  describe('edge cases', () => {
    test('should handle empty coordinate guess', () => {
      const result = player.makeGuess('');
      expect(result.success).toBe(false);
      expect(result.invalid).toBe(true);
    });

    test('should handle null coordinate guess', () => {
      const result = player.makeGuess(null);
      expect(result.success).toBe(false);
      expect(result.invalid).toBe(true);
    });

    test('should handle undefined coordinate guess', () => {
      const result = player.makeGuess(undefined);
      expect(result.success).toBe(false);
      expect(result.invalid).toBe(true);
    });
  });
}); 