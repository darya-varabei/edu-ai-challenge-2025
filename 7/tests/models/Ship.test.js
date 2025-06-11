import { Ship } from '../../src/models/Ship.js';

describe('Ship', () => {
  let ship;

  beforeEach(() => {
    ship = new Ship(3);
  });

  describe('constructor', () => {
    test('should create ship with default length of 3', () => {
      const defaultShip = new Ship();
      expect(defaultShip.length).toBe(3);
      expect(defaultShip.locations).toEqual([]);
      expect(defaultShip.hits).toBeInstanceOf(Set);
      expect(defaultShip.hits.size).toBe(0);
    });

    test('should create ship with custom length', () => {
      const customShip = new Ship(5);
      expect(customShip.length).toBe(5);
    });
  });

  describe('place', () => {
    test('should place ship horizontally', () => {
      ship.place(2, 3, 'horizontal');
      expect(ship.locations).toEqual(['23', '24', '25']);
      expect(ship.hits.size).toBe(0);
    });

    test('should place ship vertically', () => {
      ship.place(2, 3, 'vertical');
      expect(ship.locations).toEqual(['23', '33', '43']);
      expect(ship.hits.size).toBe(0);
    });

    test('should clear previous placement when placing again', () => {
      ship.place(0, 0, 'horizontal');
      ship.hits.add('00');
      
      ship.place(5, 5, 'vertical');
      expect(ship.locations).toEqual(['55', '65', '75']);
      expect(ship.hits.size).toBe(0);
    });
  });

  describe('checkHit', () => {
    beforeEach(() => {
      ship.place(2, 3, 'horizontal'); // locations: ['23', '24', '25']
    });

    test('should return true for valid hit', () => {
      const result = ship.checkHit('24');
      expect(result).toBe(true);
      expect(ship.hits.has('24')).toBe(true);
    });

    test('should return false for miss', () => {
      const result = ship.checkHit('26');
      expect(result).toBe(false);
      expect(ship.hits.has('26')).toBe(false);
    });

    test('should return false for already hit location', () => {
      ship.checkHit('24');
      const secondHit = ship.checkHit('24');
      expect(secondHit).toBe(false);
      expect(ship.hits.size).toBe(1);
    });

    test('should handle multiple hits', () => {
      expect(ship.checkHit('23')).toBe(true);
      expect(ship.checkHit('24')).toBe(true);
      expect(ship.checkHit('25')).toBe(true);
      expect(ship.hits.size).toBe(3);
    });
  });

  describe('isSunk', () => {
    beforeEach(() => {
      ship.place(2, 3, 'horizontal'); // locations: ['23', '24', '25']
    });

    test('should return false when no hits', () => {
      expect(ship.isSunk()).toBe(false);
    });

    test('should return false with partial hits', () => {
      ship.checkHit('23');
      ship.checkHit('24');
      expect(ship.isSunk()).toBe(false);
    });

    test('should return true when all locations hit', () => {
      ship.checkHit('23');
      ship.checkHit('24');
      ship.checkHit('25');
      expect(ship.isSunk()).toBe(true);
    });
  });

  describe('getLocations', () => {
    test('should return copy of locations array', () => {
      ship.place(1, 1, 'horizontal');
      const locations = ship.getLocations();
      expect(locations).toEqual(['11', '12', '13']);
      
      // Modifying returned array shouldn't affect original
      locations.push('14');
      expect(ship.locations).toEqual(['11', '12', '13']);
    });

    test('should return empty array for unplaced ship', () => {
      expect(ship.getLocations()).toEqual([]);
    });
  });

  describe('getHits', () => {
    beforeEach(() => {
      ship.place(0, 0, 'vertical'); // locations: ['00', '10', '20']
    });

    test('should return array of hit locations', () => {
      ship.checkHit('00');
      ship.checkHit('20');
      
      const hits = ship.getHits();
      expect(hits).toContain('00');
      expect(hits).toContain('20');
      expect(hits).not.toContain('10');
      expect(hits.length).toBe(2);
    });

    test('should return empty array when no hits', () => {
      expect(ship.getHits()).toEqual([]);
    });

    test('should return copy of hits', () => {
      ship.checkHit('00');
      const hits = ship.getHits();
      hits.push('99'); // This shouldn't affect the original
      expect(ship.getHits()).toEqual(['00']);
    });
  });

  describe('hasLocation', () => {
    beforeEach(() => {
      ship.place(3, 4, 'horizontal'); // locations: ['34', '35', '36']
    });

    test('should return true for ship locations', () => {
      expect(ship.hasLocation('34')).toBe(true);
      expect(ship.hasLocation('35')).toBe(true);
      expect(ship.hasLocation('36')).toBe(true);
    });

    test('should return false for non-ship locations', () => {
      expect(ship.hasLocation('33')).toBe(false);
      expect(ship.hasLocation('37')).toBe(false);
      expect(ship.hasLocation('44')).toBe(false);
    });

    test('should return false for unplaced ship', () => {
      const unplacedShip = new Ship(3);
      expect(unplacedShip.hasLocation('00')).toBe(false);
    });
  });

  describe('edge cases', () => {
    test('should handle ship length of 1', () => {
      const singleShip = new Ship(1);
      singleShip.place(5, 5, 'horizontal');
      expect(singleShip.locations).toEqual(['55']);
      expect(singleShip.checkHit('55')).toBe(true);
      expect(singleShip.isSunk()).toBe(true);
    });

    test('should handle large ship lengths', () => {
      const largeShip = new Ship(10);
      largeShip.place(0, 0, 'vertical');
      expect(largeShip.locations.length).toBe(10);
      expect(largeShip.locations[0]).toBe('00');
      expect(largeShip.locations[9]).toBe('90');
    });
  });
}); 