import { Game } from './controllers/Game.js';

/**
 * Main entry point for the Sea Battle game
 */
async function main() {
  try {
    const game = new Game({
      boardSize: 10,
      numberOfShips: 3,
      shipLength: 3
    });

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n\nGame interrupted. Thanks for playing! 👋');
      game.cleanup();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.log('\n\nGame terminated. Thanks for playing! 👋');
      game.cleanup();
      process.exit(0);
    });

    // Start the game
    await game.start();
    
  } catch (error) {
    console.error('❌ An unexpected error occurred:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the game
main().catch(error => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
}); 