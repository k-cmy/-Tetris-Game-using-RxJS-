/**
 * Constants used in the Tetris game.
 */
const Viewport = {
  CANVAS_WIDTH: 400, // The width of the game canvas (10 blocks * 40px)
  CANVAS_HEIGHT: 800, // The height of the game canvas (20 blocks * 40px)
  PREVIEW_WIDTH: 160, // The width of the preview canvas
  PREVIEW_HEIGHT: 160, // The height of the preview canvas
};

const Constants = {
  TICK_RATE_MS: 500, // The time interval in milliseconds for each game tick
  GRID_WIDTH: 10, // The width of the game grid
  GRID_HEIGHT: 20, // The height of the game grid
};

const Block = {
  WIDTH: 40, // The width of a single block (much larger for better visibility)
  HEIGHT: 40, // The height of a single block (much larger for better visibility)
};

export {Viewport ,Constants , Block};