/**
 * Constants used in the Tetris game.
 */
const Viewport = {
  CANVAS_WIDTH: 200, // The width of the game canvas
  CANVAS_HEIGHT: 400, // The height of the game canvas
  PREVIEW_WIDTH: 160, // The width of the preview canvas
  PREVIEW_HEIGHT: 80, // The height of the preview canvas
};

const Constants = {
  TICK_RATE_MS: 500, // The time interval in milliseconds for each game tick
  GRID_WIDTH: 10, // The width of the game grid
  GRID_HEIGHT: 20, // The height of the game grid
};

const Block = {
  WIDTH: Viewport.CANVAS_WIDTH / Constants.GRID_WIDTH, // The width of a single block
  HEIGHT: Viewport.CANVAS_HEIGHT / Constants.GRID_HEIGHT, // The height of a single block
};

  export {Viewport ,Constants , Block};