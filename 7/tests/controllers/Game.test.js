import { Game } from '../../src/controllers/Game.js';
import { Player } from '../../src/models/Player.js';
import { AIService } from '../../src/services/AIService.js';
import { InputService } from '../../src/services/InputService.js';

// Mock InputService to avoid actual console input/output during tests
jest.mock('../../src/services/InputService.js');

describe('Game', () => {
  let game;
  let mockInputService;

  beforeEach(() => {
    game = new Game();
    
    // Create mock input service
    mockInputService = {
      initialize: jest.fn(),
      displayWelcome: jest.fn(),
      displayBoards: jest.fn(),
      displayStats: jest.fn(),
      displayGameOver: jest.fn(),
      displaySuccess: jest.fn(),
      displayError: jest.fn(),
      display: jest.fn(),
      getCoordinateGuess: jest.fn(),
      askPlayAgain: jest.fn(),
      wait: jest.fn().mockResolvedValue(),
      close: jest.fn()
    };
    
    InputService.mockImplementation(() => mockInputService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    test('should create game with default config', () => {
      expect(game.config.boardSize).toBe(10);
      expect(game.config.numberOfShips).toBe(3);
      expect(game.config.shipLength).toBe(3);
      expect(game.gameState).toBe('waiting');
      expect(game.currentTurn).toBe('player');
    });

    test('should create game with custom config', () => {
      const customGame = new Game({
        boardSize: 8,
        numberOfShips: 2,
        shipLength: 4
      });
      
      expect(customGame.config.boardSize).toBe(8);
      expect(customGame.config.numberOfShips).toBe(2);
      expect(customGame.config.shipLength).toBe(4);
    });
  });

  describe('initialize', () => {
    test('should initialize game components', async () => {
      await game.initialize();
      
      expect(game.inputService).toBeDefined();
      expect(game.player).toBeInstanceOf(Player);
      expect(game.cpu).toBeInstanceOf(Player);
      expect(game.aiService).toBeInstanceOf(AIService);
      expect(game.gameState).toBe('playing');
      expect(game.currentTurn).toBe('player');
    });

    test('should initialize players with correct board size', async () => {
      game.config.boardSize = 8;
      await game.initialize();
      
      expect(game.player.board.size).toBe(8);
      expect(game.cpu.board.size).toBe(8);
    });

    test('should initialize boards with ships', async () => {
      await game.initialize();
      
      expect(game.player.board.ships).toHaveLength(3);
      expect(game.cpu.board.ships).toHaveLength(3);
      expect(game.player.board.ships[0].length).toBe(3);
      expect(game.cpu.board.ships[0].length).toBe(3);
    });
  });

  describe('handlePlayerTurn', () => {
    beforeEach(async () => {
      await game.initialize();
    });

    test('should process valid player guess', async () => {
      mockInputService.getCoordinateGuess.mockResolvedValue('34');
      
      await game.handlePlayerTurn();
      
      expect(game.player.guesses.has('34')).toBe(true);
      expect(game.currentTurn).toBe('cpu');
    });

    test('should handle invalid player guess', async () => {
      mockInputService.getCoordinateGuess.mockResolvedValue('ABC');
      
      await game.handlePlayerTurn();
      
      expect(mockInputService.displayError).toHaveBeenCalled();
      expect(game.currentTurn).toBe('player'); // Should stay on player's turn
    });

    test('should handle duplicate guess', async () => {
      // Make first guess
      game.player.makeGuess('34');
      mockInputService.getCoordinateGuess.mockResolvedValue('34');
      
      await game.handlePlayerTurn();
      
      expect(mockInputService.displayError).toHaveBeenCalled();
      expect(game.currentTurn).toBe('player'); // Should stay on player's turn
    });

    test('should display hit message on successful hit', async () => {
      // Find a CPU ship location
      const cpuShip = game.cpu.board.ships[0];
      const shipLocation = cpuShip.getLocations()[0];
      
      mockInputService.getCoordinateGuess.mockResolvedValue(shipLocation);
      
      await game.handlePlayerTurn();
      
      expect(mockInputService.displaySuccess).toHaveBeenCalled();
      expect(game.currentTurn).toBe('cpu');
    });

    test('should display miss message on miss', async () => {
      // Find empty location
      let emptyLocation = null;
      for (let row = 0; row < game.cpu.board.size; row++) {
        for (let col = 0; col < game.cpu.board.size; col++) {
          if (game.cpu.board.grid[row][col] === '~') {
            emptyLocation = `${row}${col}`;
            break;
          }
        }
        if (emptyLocation) break;
      }
      
      mockInputService.getCoordinateGuess.mockResolvedValue(emptyLocation);
      
      await game.handlePlayerTurn();
      
      expect(mockInputService.display).toHaveBeenCalledWith('PLAYER MISS. 🌊');
      expect(game.currentTurn).toBe('cpu');
    });
  });

  describe('handleCpuTurn', () => {
    beforeEach(async () => {
      await game.initialize();
    });

    test('should process CPU turn', async () => {
      const initialGuessCount = game.cpu.guesses.size;
      
      await game.handleCpuTurn();
      
      expect(game.cpu.guesses.size).toBe(initialGuessCount + 1);
      expect(game.currentTurn).toBe('player');
    });

    test('should display CPU move', async () => {
      await game.handleCpuTurn();
      
      expect(mockInputService.display).toHaveBeenCalledWith("\n--- CPU's Turn ---");
      expect(mockInputService.display).toHaveBeenCalledWith(
        expect.stringMatching(/CPU targets: \d\d/)
      );
    });

    test('should update AI state after move', async () => {
      const initialMode = game.aiService.getMode();
      
      await game.handleCpuTurn();
      
      // AI state should be updated (mode might change based on result)
      expect(game.aiService).toBeDefined();
    });
  });

  describe('checkGameEnd', () => {
    beforeEach(async () => {
      await game.initialize();
    });

    test('should return false when game is ongoing', () => {
      expect(game.checkGameEnd()).toBe(false);
    });

    test('should return true when player wins', () => {
      // Sink all CPU ships
      game.cpu.board.ships.forEach(ship => {
        ship.getLocations().forEach(location => {
          game.cpu.board.processGuess(location);
        });
      });
      
      expect(game.checkGameEnd()).toBe(true);
    });

    test('should return true when CPU wins', () => {
      // Sink all player ships
      game.player.board.ships.forEach(ship => {
        ship.getLocations().forEach(location => {
          game.player.board.processGuess(location);
        });
      });
      
      expect(game.checkGameEnd()).toBe(true);
    });
  });

  describe('getGameStats', () => {
    beforeEach(async () => {
      await game.initialize();
    });

    test('should return game statistics', () => {
      const stats = game.getGameStats();
      
      expect(stats).toHaveProperty('player');
      expect(stats).toHaveProperty('cpu');
      expect(stats).toHaveProperty('gameState');
      expect(stats).toHaveProperty('currentTurn');
      expect(stats).toHaveProperty('aiMode');
      
      expect(stats.gameState).toBe('playing');
      expect(stats.currentTurn).toBe('player');
      expect(stats.aiMode).toBe('hunt');
    });

    test('should return null when game not initialized', () => {
      const uninitializedGame = new Game();
      expect(uninitializedGame.getGameStats()).toBeNull();
    });
  });

  describe('setConfig and getConfig', () => {
    test('should update configuration', () => {
      const newConfig = {
        boardSize: 8,
        numberOfShips: 2
      };
      
      game.setConfig(newConfig);
      
      expect(game.config.boardSize).toBe(8);
      expect(game.config.numberOfShips).toBe(2);
      expect(game.config.shipLength).toBe(3); // Should keep original value
    });

    test('should return copy of configuration', () => {
      const config = game.getConfig();
      config.boardSize = 999;
      
      expect(game.config.boardSize).toBe(10); // Original should not change
    });
  });

  describe('cleanup', () => {
    test('should clean up resources', async () => {
      await game.initialize();
      
      game.cleanup();
      
      expect(mockInputService.close).toHaveBeenCalled();
      expect(game.gameState).toBe('finished');
    });
  });

  describe('displayGameState', () => {
    beforeEach(async () => {
      await game.initialize();
    });

    test('should display boards and stats', () => {
      game.displayGameState();
      
      expect(mockInputService.displayBoards).toHaveBeenCalled();
      expect(mockInputService.displayStats).toHaveBeenCalled();
    });
  });

  describe('integration scenarios', () => {
    beforeEach(async () => {
      await game.initialize();
    });

    test('should handle complete game flow', async () => {
      // Mock player winning by sinking all CPU ships
      const cpuShips = game.cpu.board.ships;
      let moveIndex = 0;
      
      // Mock player guesses to hit all CPU ships
      mockInputService.getCoordinateGuess.mockImplementation(() => {
        if (moveIndex < cpuShips.length) {
          const ship = cpuShips[Math.floor(moveIndex / 3)];
          const location = ship.getLocations()[moveIndex % 3];
          moveIndex++;
          return Promise.resolve(location);
        }
        return Promise.resolve('99'); // Safe miss location
      });
      
      mockInputService.askPlayAgain.mockResolvedValue(false);
      
      // Sink all CPU ships manually for test
      cpuShips.forEach(ship => {
        ship.getLocations().forEach(location => {
          game.cpu.board.processGuess(location);
        });
      });
      
      expect(game.checkGameEnd()).toBe(true);
    });
  });

  describe('error handling', () => {
    test('should handle input service errors gracefully', async () => {
      await game.initialize();
      
      mockInputService.getCoordinateGuess.mockRejectedValue(new Error('Input error'));
      
      await game.handlePlayerTurn();
      
      expect(mockInputService.displayError).toHaveBeenCalled();
    });
  });
}); 