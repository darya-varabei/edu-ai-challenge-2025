const { Enigma, Rotor, plugboardSwap, alphabet, ROTORS, REFLECTOR } = require('./enigma.js');

describe('Enigma Machine Tests', () => {
  
  describe('Basic Functionality', () => {
    test('should encrypt and decrypt text correctly without plugboard', () => {
      const enigma1 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
      const enigma2 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
      
      const plaintext = 'HELLO';
      const encrypted = enigma1.process(plaintext);
      const decrypted = enigma2.process(encrypted);
      
      expect(decrypted).toBe(plaintext);
      expect(encrypted).not.toBe(plaintext);
    });

    test('should encrypt and decrypt text correctly with plugboard', () => {
      const plugboard = [['A', 'B'], ['C', 'D']];
      const enigma1 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], plugboard);
      const enigma2 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], plugboard);
      
      const plaintext = 'ABCD';
      const encrypted = enigma1.process(plaintext);
      const decrypted = enigma2.process(encrypted);
      
      expect(decrypted).toBe(plaintext);
      expect(encrypted).not.toBe(plaintext);
    });

    test('should handle single character encryption/decryption', () => {
      const enigma1 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
      const enigma2 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
      
      const char = 'A';
      const encrypted = enigma1.encryptChar(char);
      const decrypted = enigma2.encryptChar(encrypted);
      
      expect(decrypted).toBe(char);
      expect(encrypted).not.toBe(char);
    });

    test('should preserve non-alphabetic characters', () => {
      const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
      const input = 'HELLO 123!';
      const output = enigma.process(input);
      
      expect(output).toMatch(/^[A-Z 0-9!]+$/);
      expect(output.includes(' ')).toBeTruthy();
      expect(output.includes('1')).toBeTruthy();
      expect(output.includes('!')).toBeTruthy();
    });

    test('should convert lowercase to uppercase', () => {
      const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
      const result = enigma.process('hello');
      
      expect(result).toMatch(/^[A-Z]+$/);
    });
  });

  describe('Rotor Functionality', () => {
    test('should create rotor with correct properties', () => {
      const rotor = new Rotor('ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'A', 0, 5);
      
      expect(rotor.wiring).toBe('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
      expect(rotor.notch).toBe('A');
      expect(rotor.ringSetting).toBe(0);
      expect(rotor.position).toBe(5);
    });

    test('should step rotor correctly', () => {
      const rotor = new Rotor('ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'A', 0, 0);
      
      rotor.step();
      expect(rotor.position).toBe(1);
      
      rotor.position = 25;
      rotor.step();
      expect(rotor.position).toBe(0);
    });

    test('should detect notch position correctly', () => {
      const rotor = new Rotor('ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'E', 0, 4);
      
      expect(rotor.atNotch()).toBeTruthy();
      
      rotor.step();
      expect(rotor.atNotch()).toBeFalsy();
    });

    test('should perform forward substitution', () => {
      const rotor = new Rotor(ROTORS[0].wiring, ROTORS[0].notch, 0, 0);
      const result = rotor.forward('A');
      
      expect(result).toBe('E'); // First letter of Rotor I wiring
    });

    test('should perform backward substitution', () => {
      const rotor = new Rotor(ROTORS[0].wiring, ROTORS[0].notch, 0, 0);
      const result = rotor.backward('E');
      
      expect(result).toBe('A');
    });
  });

  describe('Rotor Stepping', () => {
    test('should step rightmost rotor on each character', () => {
      const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
      const initialPos = enigma.rotors[2].position;
      
      enigma.encryptChar('A');
      
      expect(enigma.rotors[2].position).toBe((initialPos + 1) % 26);
    });

    test('should handle rotor turnover (double stepping)', () => {
      // Set middle rotor at notch position
      const enigma = new Enigma([0, 1, 2], [0, 4, 4], [0, 0, 0], []); // E is notch for rotor II
      
      const beforeLeft = enigma.rotors[0].position;
      const beforeMiddle = enigma.rotors[1].position;
      const beforeRight = enigma.rotors[2].position;
      
      enigma.encryptChar('A');
      
      // Middle rotor should step (double stepping)
      expect(enigma.rotors[1].position).toBe((beforeMiddle + 1) % 26);
      // Left rotor should step
      expect(enigma.rotors[0].position).toBe((beforeLeft + 1) % 26);
      // Right rotor always steps
      expect(enigma.rotors[2].position).toBe((beforeRight + 1) % 26);
    });
  });

  describe('Ring Settings', () => {
    test('should work with different ring settings', () => {
      const enigma1 = new Enigma([0, 1, 2], [0, 0, 0], [1, 2, 3], []);
      const enigma2 = new Enigma([0, 1, 2], [0, 0, 0], [1, 2, 3], []);
      
      const plaintext = 'TEST';
      const encrypted = enigma1.process(plaintext);
      const decrypted = enigma2.process(encrypted);
      
      expect(decrypted).toBe(plaintext);
    });
  });

  describe('Different Rotor Positions', () => {
    test('should work with different starting positions', () => {
      const enigma1 = new Enigma([0, 1, 2], [5, 10, 15], [0, 0, 0], []);
      const enigma2 = new Enigma([0, 1, 2], [5, 10, 15], [0, 0, 0], []);
      
      const plaintext = 'POSITIONS';
      const encrypted = enigma1.process(plaintext);
      const decrypted = enigma2.process(encrypted);
      
      expect(decrypted).toBe(plaintext);
    });
  });

  describe('Plugboard Functionality', () => {
    test('plugboardSwap should swap characters correctly', () => {
      const pairs = [['A', 'B'], ['C', 'D']];
      
      expect(plugboardSwap('A', pairs)).toBe('B');
      expect(plugboardSwap('B', pairs)).toBe('A');
      expect(plugboardSwap('C', pairs)).toBe('D');
      expect(plugboardSwap('D', pairs)).toBe('C');
      expect(plugboardSwap('E', pairs)).toBe('E');
    });

    test('should handle empty plugboard', () => {
      expect(plugboardSwap('A', [])).toBe('A');
    });

    test('should work with multiple plugboard pairs', () => {
      const plugboard = [['A', 'B'], ['C', 'D'], ['E', 'F'], ['G', 'H']];
      const enigma1 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], plugboard);
      const enigma2 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], plugboard);
      
      const plaintext = 'ABCDEFGH';
      const encrypted = enigma1.process(plaintext);
      const decrypted = enigma2.process(encrypted);
      
      expect(decrypted).toBe(plaintext);
    });
  });

  describe('Different Rotor Combinations', () => {
    test('should work with different rotor order', () => {
      const enigma1 = new Enigma([2, 1, 0], [0, 0, 0], [0, 0, 0], []);
      const enigma2 = new Enigma([2, 1, 0], [0, 0, 0], [0, 0, 0], []);
      
      const plaintext = 'ROTORS';
      const encrypted = enigma1.process(plaintext);
      const decrypted = enigma2.process(encrypted);
      
      expect(decrypted).toBe(plaintext);
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty string', () => {
      const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
      const result = enigma.process('');
      
      expect(result).toBe('');
    });

    test('should handle string with only spaces and numbers', () => {
      const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
      const result = enigma.process('123 456');
      
      expect(result).toBe('123 456');
    });

    test('should handle maximum rotor position values', () => {
      const enigma = new Enigma([0, 1, 2], [25, 25, 25], [25, 25, 25], []);
      const result = enigma.process('Z');
      
      expect(result.length).toBe(1);
      expect(alphabet.includes(result)).toBeTruthy();
    });
  });

  describe('Historical Accuracy Tests', () => {
    test('should produce different outputs for same input with different settings', () => {
      const enigma1 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
      const enigma2 = new Enigma([0, 1, 2], [1, 1, 1], [0, 0, 0], []);
      
      const plaintext = 'ATTACK';
      const result1 = enigma1.process(plaintext);
      const result2 = enigma2.process(plaintext);
      
      expect(result1).not.toBe(result2);
    });

    test('should never encrypt a letter to itself', () => {
      const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
      
      for (let i = 0; i < alphabet.length; i++) {
        const char = alphabet[i];
        const encrypted = enigma.encryptChar(char);
        expect(encrypted).not.toBe(char);
      }
    });
  });

  describe('Long Message Tests', () => {
    test('should handle long messages correctly', () => {
      const enigma1 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], [['A', 'B']]);
      const enigma2 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], [['A', 'B']]);
      
      const plaintext = 'THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG';
      const encrypted = enigma1.process(plaintext);
      const decrypted = enigma2.process(encrypted);
      
      expect(decrypted).toBe(plaintext);
    });
  });
}); 