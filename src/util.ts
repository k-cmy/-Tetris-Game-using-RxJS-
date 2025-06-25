/**
 * Utility functions for various Tetris game operations.
 */
import { Position, Shape, Grid, Color, ColorGrid, TetrominoType, Tetromino } from './types';
import { Constants } from './constants';

// Classic Tetris Colors for each tetromino type
const TETROMINO_COLORS: Record<TetrominoType, Color> = {
  'I': '#00FFFF', // Cyan - I-piece (line)
  'O': '#FFFF00', // Yellow - O-piece (square)  
  'T': '#8B00FF', // Purple - T-piece
  'S': '#00FF00', // Green - S-piece
  'Z': '#FF0000', // Red - Z-piece
  'J': '#0000FF', // Blue - J-piece
  'L': '#FFA500', // Orange - L-piece
};

// Define different kinds of shapes with their types
const tetrominoes: Record<TetrominoType, Shape> = {
  'O': [[true, true], [true, true]], // Square
  'I': [[true, true, true, true]], // Line
  'T': [[true, true, true], [false, true, false]], // T-shape
  'L': [[true, true, true], [true, false, false]], // L-shape
  'J': [[true, true, true], [false, false, true]], // J-shape (reverse L)
  'S': [[false, true, true], [true, true, false]], // S-shape
  'Z': [[true, true, false], [false, true, true]], // Z-shape
};

// For backward compatibility
const squareShape: Shape = tetrominoes['O'];

/**
 * Creates a tetromino object with shape, type, and color
 */
const createTetromino = (type: TetrominoType): Tetromino => ({
  shape: tetrominoes[type],
  type: type,
  color: TETROMINO_COLORS[type]
});

/**
 * Gets a random tetromino type
 */
const getRandomTetrominoType = (): TetrominoType => {
  const types: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
  return types[Math.floor(Math.random() * types.length)];
};

/**
 * Gets a random tetromino with proper type and color
 */
const getRandomTetromino = (): Tetromino => {
  const type = getRandomTetrominoType();
  return createTetromino(type);
};

/**
 * Creates an empty grid with no occupied cells.
 * @returns Empty grid
 */
const emptyGrid = (): Grid =>
  Array(Constants.GRID_HEIGHT).fill(null).map(() => 
    Array(Constants.GRID_WIDTH).fill(false)
  );

/**
 * Creates an empty color grid with no colors.
 * @returns Empty color grid
 */
const emptyColorGrid = (): ColorGrid =>
  Array(Constants.GRID_HEIGHT).fill(null).map(() => 
    Array(Constants.GRID_WIDTH).fill(null)
  );

/**
 * Checks if a given position and shape would result in a collision with the existing grid.
 * @param position Current position of the shape
 * @param shape Shape to be placed
 * @param grid Current grid state
 * @returns True if collision is detected, false otherwise
 */
const checkCollision = (position: Position, shape: Shape, grid: Grid): boolean => {
  // Generate an array for moving shape's cells positions to keep track 
  const movingShapeCells = shape.reduce((acc, row, rowIndex) => {
    row.forEach((column, columnIndex) => {
      if (column) {
        const rowPosition = position[0] + rowIndex;
        const columnPosition = position[1] + columnIndex;
        acc.push([rowPosition, columnPosition]);
      }
    });
    return acc;
  }, [] as Position[]);
  
  // Check if any moving shape's block collides with another placed cell 
  return movingShapeCells.some(([row, column]) => {
    // Check if the shape's blocks reach the last row of the grid or collide with another placed shape's cell
    if (row >= Constants.GRID_HEIGHT || (grid[row] && grid[row][column])) {
      return true;
    }
  });
};

/**
 * Rotates a given shape by 90 degrees clockwise.
 * @param shape Shape to be rotated
 * @returns Rotated shape
 */
const rotateShape = (shape: Shape): Shape => {
  // Calculate the dimensions of the rotated shape
  const numRows = shape[0].length;
  const numColumns = shape.length;

  // Create an empty grid for the rotated shape
  const rotatedShape: Shape = Array(numRows)
    .fill(null)
    .map(() => Array(numColumns).fill(false));

  // Copy the cells from the original shape to the rotated shape 
  shape.forEach((row, rowIndex) => {
    row.forEach((column, columnIndex) => {
      rotatedShape[columnIndex][numColumns - rowIndex - 1] = column;
    });
  });
  return rotatedShape;
};

/**
 * Places a shape of blocks on the grid based on its position.
 * @param position Current position of the shape
 * @param shape Shape to be placed
 * @param grid Current grid state
 * @returns Updated grid with placed shape
 */
const placeShapesOfBlocks = (position: Position, shape: Shape, grid: Grid): Grid => {
  // Create a new grid by copying the existing grid and updating occupied cells
  return grid.map((row, rowIndex) =>
    row.map((column, columnIndex) => {
      const rowPosition = rowIndex - position[0];
      const columnPosition = columnIndex - position[1];
      const isOccupied = shape[rowPosition]?.[columnPosition] ?? false;
      return column || isOccupied;
    })
  );
};

/**
 * Places a tetromino's colors on the color grid based on its position.
 * @param position Current position of the tetromino
 * @param tetromino Tetromino to be placed
 * @param colorGrid Current color grid state
 * @returns Updated color grid with placed tetromino colors
 */
const placeTetrominoColors = (position: Position, tetromino: Tetromino, colorGrid: ColorGrid): ColorGrid => {
  return colorGrid.map((row, rowIndex) =>
    row.map((color, columnIndex) => {
      const rowPosition = rowIndex - position[0];
      const columnPosition = columnIndex - position[1];
      const isOccupied = tetromino.shape[rowPosition]?.[columnPosition] ?? false;
      return color || (isOccupied ? tetromino.color : null);
    })
  );
};

/**
 * Checks if the first row of the grid is fully occupied.
 * @param grid Current grid state
 * @returns True if the first row is fully occupied, false otherwise
 */
const isFirstRowFilled = (grid: Grid): boolean => {
  const firstRow = grid[0]; //get top row of the grid 
  return firstRow.some(cell => cell); // if there is at least a cell returns true in the top row  
};

/**
 * Checks if a row is fully filled with blocks.
 * @param row Row to check
 * @returns True if the row is fully filled, false otherwise
 */
const rowIsFilled = (row: boolean[]): boolean => {
  return row.every(cell => cell); //when an entire row in grid is occupied 
};

/**
 * Calculates the score threshold required for reaching the next level.
 * @param level Current level
 * @returns Score threshold for the next level
 */
const scoreThresholdForNextLevel = (level: number): number => {
  // The base score threshold for level 1 is 100 points
  const baseThreshold = 100;
  
  // Each subsequent level increases the threshold by 100 points
  const increment = 100;
  
  // Calculate the threshold for the given level
  return baseThreshold + (increment * (level - 1));
};

/**
 * Checks if a given position is valid for the shape placement.
 * @param position Current position of the shape
 * @param shape Shape to be placed
 * @returns True if the position is valid, false otherwise
 */
const isPositionValid = (position: Position, shape: Shape): boolean => {
  // Calculate the maximum row and column indices for the shape
  const maxRow = position[0] + (shape.length - 1) ;
  const maxCol = position[1] + (shape[0].length - 1) ;

  // Check if the shape's cells are within the grid boundaries
  return (
    position[0] <= 0 || // Top boundary
    maxRow > Constants.GRID_HEIGHT || // Bottom boundary
    position[1] < 0 || // Left boundary
    maxCol >= Constants.GRID_WIDTH // Right boundary
  ) ? false : true;
};

// Legacy functions for backward compatibility
const randomShapes = (): Shape => getRandomTetromino().shape;
const randomColors = (): Color => getRandomTetromino().color;
  
export {
  checkCollision,
  randomShapes,
  placeShapesOfBlocks,
  placeTetrominoColors,
  emptyGrid,
  emptyColorGrid,
  isFirstRowFilled,
  scoreThresholdForNextLevel,
  rowIsFilled,
  squareShape,
  randomColors,
  isPositionValid,
  rotateShape,
  getRandomTetromino,
  createTetromino,
  TETROMINO_COLORS
};