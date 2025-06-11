import { AIService } from '../../src/services/AIService.js';
import { Ship } from '../../src/models/Ship.js';

describe('AIService', () => {
  let aiService;
  let previousGuesses;

  beforeEach(() => {
    aiService = new AIService(10);
    previousGuesses = new Set();
  });

  describe('constructor', () => {
    test('should create AI service with default board size', () => {
      const defaultAI = new AIService();
      expect(defaultAI.boardSize).toBe(10);
      expect(defaultAI.mode).toBe('hunt');
      expect(defaultAI.targetQueue).toEqual([]);
      expect(defaultAI.previousHits).toEqual([]);
    });

    test('should create AI service with custom board size', () => {
      const customAI = new AIService(8);
      expect(customAI.boardSize).toBe(8);
    });
  });

  describe('generateMove in hunt mode', () => {
    test('should generate valid coordinate in hunt mode', () => {
      const move = aiService.generateMove(previousGuesses);
      
      expect(move).toHaveLength(2);
      expect(move).toMatch(/^[0-9][0-9]$/);
      
      const row = parseInt(move[0]);
      const col = parseInt(move[1]);
      expect(row).toBeGreaterThanOrEqual(0);
      expect(row).toBeLessThan(10);
      expect(col).toBeGreaterThanOrEqual(0);
      expect(col).toBeLessThan(10);
    });

    test('should not generate already guessed coordinates', () => {
      previousGuesses.add('00');
      previousGuesses.add('11');
      previousGuesses.add('22');
      
      const move = aiService.generateMove(previousGuesses);
      expect(previousGuesses.has(move)).toBe(false);
    });

    test('should generate different moves on subsequent calls', () => {
      const moves = new Set();
      
      // Generate multiple moves
      for (let i = 0; i < 10; i++) {
        const move = aiService.generateMove(previousGuesses);
        moves.add(move);
        previousGuesses.add(move);
      }
      
      // Should generate different moves (with high probability)
      expect(moves.size).toBeGreaterThan(1);
    });
  });

  describe('generateMove in target mode', () => {
    beforeEach(() => {
      aiService.mode = 'target';
      aiService.targetQueue = ['11', '33', '55'];
    });

    test('should use target queue when in target mode', () => {
      const move = aiService.generateMove(previousGuesses);
      expect(['11', '33', '55']).toContain(move);
    });

    test('should skip already guessed targets', () => {
      previousGuesses.add('11');
      previousGuesses.add('33');
      
      const move = aiService.generateMove(previousGuesses);
      expect(move).toBe('55');
    });

    test('should switch to hunt mode when no valid targets', () => {
      previousGuesses.add('11');
      previousGuesses.add('33');
      previousGuesses.add('55');
      
      const move = aiService.generateMove(previousGuesses);
      expect(aiService.mode).toBe('hunt');
      expect(move).toMatch(/^[0-9][0-9]$/);
    });
  });

  describe('updateState with hits', () => {
    test('should switch to target mode on hit', () => {
      const result = { hit: true, sunk: false };
      aiService.updateState('44', result);
      
      expect(aiService.mode).toBe('target');
      expect(aiService.previousHits).toContain('44');
      expect(aiService.targetQueue.length).toBeGreaterThan(0);
    });

    test('should add adjacent coordinates to target queue', () => {
      const result = { hit: true, sunk: false };
      aiService.updateState('44', result);
      
      const expectedTargets = ['34', '54', '43', '45'];
      expectedTargets.forEach(target => {
        expect(aiService.targetQueue).toContain(target);
      });
    });

    test('should not add out-of-bounds coordinates', () => {
      const result = { hit: true, sunk: false };
      aiService.updateState('00', result); // Top-left corner
      
      // Should only add valid adjacent coordinates
      const validTargets = aiService.targetQueue.filter(target => {
        const row = parseInt(target[0]);
        const col = parseInt(target[1]);
        return row >= 0 && row < 10 && col >= 0 && col < 10;
      });
      
      expect(aiService.targetQueue).toEqual(validTargets);
      expect(aiService.targetQueue).toContain('10');
      expect(aiService.targetQueue).toContain('01');
    });

    test('should switch back to hunt mode when ship is sunk', () => {
      const ship = new Ship(3);
      ship.place(4, 4, 'horizontal'); // locations: ['44', '45', '46']
      
      const result = { hit: true, sunk: true, ship };
      aiService.updateState('44', result);
      
      expect(aiService.mode).toBe('hunt');
      expect(aiService.targetQueue).toEqual([]);
    });

    test('should prioritize linear targets after multiple hits', () => {
      // First hit
      aiService.updateState('44', { hit: true, sunk: false });
      
      // Second hit horizontally adjacent
      aiService.updateState('45', { hit: true, sunk: false });
      
      // Should prioritize continuing the horizontal line
      const horizontalTargets = aiService.targetQueue.filter(target => {
        const row = parseInt(target[0]);
        return row === 4; // Same row as hits
      });
      
      expect(horizontalTargets.length).toBeGreaterThan(0);
      
      // Horizontal targets should be at the beginning of the queue
      const firstFewTargets = aiService.targetQueue.slice(0, 2);
      expect(firstFewTargets.some(target => parseInt(target[0]) === 4)).toBe(true);
    });
  });

  describe('updateState with misses', () => {
    beforeEach(() => {
      aiService.mode = 'target';
      aiService.targetQueue = ['11', '22', '33'];
    });

    test('should stay in target mode on miss if targets remain', () => {
      const result = { hit: false, sunk: false };
      aiService.updateState('44', result);
      
      expect(aiService.mode).toBe('target');
      expect(aiService.targetQueue).toEqual(['11', '22', '33']);
    });

    test('should switch to hunt mode on miss if no targets remain', () => {
      aiService.targetQueue = [];
      
      const result = { hit: false, sunk: false };
      aiService.updateState('44', result);
      
      expect(aiService.mode).toBe('hunt');
    });

    test('should remove missed coordinate from target queue', () => {
      aiService.targetQueue = ['11', '22', '33'];
      
      const result = { hit: false, sunk: false };
      aiService.updateState('22', result);
      
      expect(aiService.targetQueue).not.toContain('22');
      expect(aiService.targetQueue).toContain('11');
      expect(aiService.targetQueue).toContain('33');
    });
  });

  describe('ship sinking logic', () => {
    test('should clean up target queue when ship is sunk', () => {
      const ship = new Ship(3);
      ship.place(2, 2, 'horizontal'); // locations: ['22', '23', '24']
      
      // Set up AI state as if targeting this ship
      aiService.mode = 'target';
      aiService.targetQueue = ['12', '32', '21', '25', '13', '33'];
      aiService.previousHits = ['22', '23'];
      
      const result = { hit: true, sunk: true, ship };
      aiService.updateState('24', result);
      
      // Should remove targets adjacent to the sunk ship
      const remainingTargets = aiService.targetQueue;
      const shipAdjacent = ['12', '32', '21', '25'];
      
      shipAdjacent.forEach(target => {
        expect(remainingTargets).not.toContain(target);
      });
    });

    test('should clear hits for sunk ship from previous hits', () => {
      const ship = new Ship(2);
      ship.place(3, 3, 'vertical'); // locations: ['33', '43']
      
      aiService.previousHits = ['33', '22', '43', '55'];
      
      const result = { hit: true, sunk: true, ship };
      aiService.updateState('43', result);
      
      expect(aiService.previousHits).not.toContain('33');
      expect(aiService.previousHits).not.toContain('43');
      expect(aiService.previousHits).toContain('22');
      expect(aiService.previousHits).toContain('55');
    });
  });

  describe('getMode', () => {
    test('should return current mode', () => {
      expect(aiService.getMode()).toBe('hunt');
      
      aiService.mode = 'target';
      expect(aiService.getMode()).toBe('target');
    });
  });

  describe('getTargetQueue', () => {
    test('should return copy of target queue', () => {
      aiService.targetQueue = ['11', '22', '33'];
      const queue = aiService.getTargetQueue();
      
      expect(queue).toEqual(['11', '22', '33']);
      
      // Modifying returned array shouldn't affect original
      queue.push('44');
      expect(aiService.targetQueue).not.toContain('44');
    });
  });

  describe('reset', () => {
    test('should reset AI state', () => {
      aiService.mode = 'target';
      aiService.targetQueue = ['11', '22'];
      aiService.previousHits = ['33', '44'];
      
      aiService.reset();
      
      expect(aiService.mode).toBe('hunt');
      expect(aiService.targetQueue).toEqual([]);
      expect(aiService.previousHits).toEqual([]);
    });
  });

  describe('edge cases', () => {
    test('should handle board corners correctly', () => {
      // Test all four corners
      const corners = ['00', '09', '90', '99'];
      
      corners.forEach(corner => {
        aiService.reset();
        const result = { hit: true, sunk: false };
        aiService.updateState(corner, result);
        
        // Should only add valid adjacent coordinates
        aiService.targetQueue.forEach(target => {
          const row = parseInt(target[0]);
          const col = parseInt(target[1]);
          expect(row).toBeGreaterThanOrEqual(0);
          expect(row).toBeLessThan(10);
          expect(col).toBeGreaterThanOrEqual(0);
          expect(col).toBeLessThan(10);
        });
      });
    });

    test('should handle board edges correctly', () => {
      // Test middle of each edge
      const edges = ['05', '50', '59', '95'];
      
      edges.forEach(edge => {
        aiService.reset();
        const result = { hit: true, sunk: false };
        aiService.updateState(edge, result);
        
        // Should only add valid adjacent coordinates
        aiService.targetQueue.forEach(target => {
          const row = parseInt(target[0]);
          const col = parseInt(target[1]);
          expect(row).toBeGreaterThanOrEqual(0);
          expect(row).toBeLessThan(10);
          expect(col).toBeGreaterThanOrEqual(0);
          expect(col).toBeLessThan(10);
        });
      });
    });

    test('should handle small board size', () => {
      const smallAI = new AIService(3);
      const move = smallAI.generateMove(new Set());
      
      const row = parseInt(move[0]);
      const col = parseInt(move[1]);
      expect(row).toBeGreaterThanOrEqual(0);
      expect(row).toBeLessThan(3);
      expect(col).toBeGreaterThanOrEqual(0);
      expect(col).toBeLessThan(3);
    });

    test('should handle near-full board of guesses', () => {
      const nearFullBoard = new Set();
      
      // Fill most of the board, leaving a few spots
      for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
          if (!(row >= 5 && row <= 6 && col >= 5 && col <= 6)) {
            nearFullBoard.add(`${row}${col}`);
          }
        }
      }
      
      const move = aiService.generateMove(nearFullBoard);
      
      // Should generate a valid coordinate
      expect(move).toMatch(/^[0-9][0-9]$/);
      
      // Should be one of the available spots
      const availableSpots = ['55', '56', '65', '66'];
      expect(availableSpots).toContain(move);
      
      // Should not be in previous guesses
      expect(nearFullBoard.has(move)).toBe(false);
    });
  });
}); 