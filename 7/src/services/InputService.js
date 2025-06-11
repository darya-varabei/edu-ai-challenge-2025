import readline from 'readline';

/**
 * InputService class handling user input with modern async/await
 */
export class InputService {
  constructor() {
    this.rl = null;
  }

  /**
   * Initialize the readline interface
   */
  initialize() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  /**
   * Prompt user for input and return a promise
   * @param {string} question - The question to ask the user
   * @returns {Promise<string>} The user's input
   */
  async prompt(question) {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  /**
   * Ask user for a coordinate guess
   * @returns {Promise<string>} The coordinate guess
   */
  async getCoordinateGuess() {
    return await this.prompt('Enter your guess (e.g., 34, 07): ');
  }

  /**
   * Ask user if they want to play again
   * @returns {Promise<boolean>} True if user wants to play again
   */
  async askPlayAgain() {
    const answer = await this.prompt('Would you like to play again? (y/n): ');
    return answer.toLowerCase().startsWith('y');
  }

  /**
   * Display a message to the user
   * @param {string} message - The message to display
   */
  display(message) {
    console.log(message);
  }

  /**
   * Display multiple messages
   * @param {string[]} messages - Array of messages to display
   */
  displayMultiple(messages) {
    messages.forEach(message => console.log(message));
  }

  /**
   * Clear the console
   */
  clear() {
    console.clear();
  }

  /**
   * Display a formatted board
   * @param {string[][]} opponentBoard - The opponent's board (with guesses)
   * @param {string[][]} playerBoard - The player's own board
   * @param {number} boardSize - Size of the board
   */
  displayBoards(opponentBoard, playerBoard, boardSize = 10) {
    console.log('\n   --- OPPONENT BOARD ---          --- YOUR BOARD ---');
    
    // Header row
    let header = '  ';
    for (let h = 0; h < boardSize; h++) {
      header += h + ' ';
    }
    console.log(header + '     ' + header);

    // Board rows
    for (let i = 0; i < boardSize; i++) {
      let rowStr = i + ' ';

      // Opponent board
      for (let j = 0; j < boardSize; j++) {
        rowStr += opponentBoard[i][j] + ' ';
      }
      
      rowStr += '    ' + i + ' ';

      // Player board
      for (let j = 0; j < boardSize; j++) {
        rowStr += playerBoard[i][j] + ' ';
      }
      
      console.log(rowStr);
    }
    console.log();
  }

  /**
   * Display game statistics
   * @param {Object} playerStats - Player statistics
   * @param {Object} cpuStats - CPU statistics  
   */
  displayStats(playerStats, cpuStats) {
    console.log('\n=== GAME STATISTICS ===');
    console.log(`Player: ${playerStats.totalGuesses} guesses, ${playerStats.hits} hits, ${playerStats.accuracy}% accuracy`);
    console.log(`CPU: ${cpuStats.totalGuesses} guesses, ${cpuStats.hits} hits, ${cpuStats.accuracy}% accuracy`);
    console.log(`Remaining ships - Player: ${playerStats.remainingShips}, CPU: ${cpuStats.remainingShips}`);
  }

  /**
   * Display welcome message
   */
  displayWelcome() {
    console.log('\n' + '='.repeat(50));
    console.log('           🚢 SEA BATTLE GAME 🚢');
    console.log('='.repeat(50));
    console.log('Try to sink all 3 enemy ships before they sink yours!');
    console.log('Enter coordinates like "34" to target row 3, column 4');
    console.log('Symbols: ~ = water, S = your ship, X = hit, O = miss');
    console.log('='.repeat(50) + '\n');
  }

  /**
   * Display game over message
   * @param {boolean} playerWon - True if player won, false if CPU won
   * @param {Object} playerStats - Player statistics
   * @param {Object} cpuStats - CPU statistics
   */
  displayGameOver(playerWon, playerStats, cpuStats) {
    console.log('\n' + '='.repeat(50));
    if (playerWon) {
      console.log('🎉 CONGRATULATIONS! You sunk all enemy battleships! 🎉');
    } else {
      console.log('💥 GAME OVER! The CPU sunk all your battleships! 💥');
    }
    console.log('='.repeat(50));
    
    this.displayStats(playerStats, cpuStats);
    console.log('='.repeat(50) + '\n');
  }

  /**
   * Display error message
   * @param {string} error - The error message
   */
  displayError(error) {
    console.log(`❌ Error: ${error}`);
  }

  /**
   * Display warning message
   * @param {string} warning - The warning message
   */
  displayWarning(warning) {
    console.log(`⚠️  Warning: ${warning}`);
  }

  /**
   * Display success message
   * @param {string} message - The success message
   */
  displaySuccess(message) {
    console.log(`✅ ${message}`);
  }

  /**
   * Close the readline interface
   */
  close() {
    if (this.rl) {
      this.rl.close();
      this.rl = null;
    }
  }

  /**
   * Wait for a specified amount of time
   * @param {number} ms - Milliseconds to wait
   * @returns {Promise} Promise that resolves after the specified time
   */
  async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
} 