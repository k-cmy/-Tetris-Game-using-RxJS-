/**
 * State processing functions for managing the game state and updating it.
 */

import { Position, State, Grid, ColorGrid } from './types';
import { 
  checkCollision, 
  placeShapesOfBlocks, 
  placeTetrominoColors,
  emptyGrid, 
  emptyColorGrid,
  isFirstRowFilled,
  rowIsFilled,
  scoreThresholdForNextLevel,
  isPositionValid,
  getRandomTetromino,
  createTetromino
} from './util';
import { Constants } from './constants'; 
import { pipe } from 'rxjs';
  
/**
 * Initial state of the Tetris game.
 */
const initialState: State = {
  gameEnd: false,
  currentPosition: [0, Math.floor(Constants.GRID_WIDTH / 2) - 1],
  score: 0,
  grid: emptyGrid(),
  colorGrid: emptyColorGrid(),
  currentTetromino: createTetromino('O'), // Start with square piece
  nextTetromino: getRandomTetromino(),
  level: 0,
  highScore: 0,
  blockElements: [],
  speed: Constants.TICK_RATE_MS,
  initialSpeed: Constants.TICK_RATE_MS,
  gameStop: false
};
  
/**
 * Updates the state by proceeding with one time step.
 *
 * @param s Current state
 * @param movement User input movement
 * @returns Updated state
 */
const tick = (s: State, movement: Position): State => {
  if (s.gameEnd || s.gameStop) {
    return s;
  }

  const updatedState = pipe(
    moveShapesOfBlocks(movement),
    checkGameLost,
    updateGridAndScore,
    updateLevel,
    updateSpeed
  )(s);

  return updatedState;
};

 /**
 * Moves the Shape of Blocks based on user input and handles collision detection.
 *
 * @param s Current state
 * @param movement User input movement [row, col]
 * @returns Updated state after moving the Tetromino
 */
const moveShapesOfBlocks = (movement: Position) => (s: State): State => {
  const newCurrentPosition: Position = [
    s.currentPosition[0] + movement[0],
    s.currentPosition[1] + movement[1],
  ];

  if (!isPositionValid(newCurrentPosition, s.currentTetromino.shape)) {
    return s;
  }

  if (!checkCollision(newCurrentPosition, s.currentTetromino.shape, s.grid)) {
    return {
      ...s,
      currentPosition: newCurrentPosition,
    };
  }

  // Place the tetromino on the grid
  const newGrid = placeShapesOfBlocks(s.currentPosition, s.currentTetromino.shape, s.grid);
  const newColorGrid = placeTetrominoColors(s.currentPosition, s.currentTetromino, s.colorGrid);

  // Clear any filled rows and update the score
  const [clearedGrid, clearedColorGrid, updatedScore] = clearRowsAndScore(newGrid, newColorGrid, s.score);

  // Generate the next tetromino
  const newNextTetromino = getRandomTetromino();

  // Return the new state with all updates
  return {
    ...s,
    currentPosition: [0, Math.floor(Constants.GRID_WIDTH / 2) - 1], // Reset position for the next shape
    grid: clearedGrid,
    colorGrid: clearedColorGrid,
    currentTetromino: s.nextTetromino,
    nextTetromino: newNextTetromino,
    score: updatedScore,
  };
};

/**
 * Checks if the game is lost by evaluating whether the first row of the grid is filled.
 * @param grid Current grid state
 * @returns Updated game state if game is lost, otherwise original state
 */
const checkGameLost = (s: State): State => {
  if (gameLost(s.grid)) {
    return updateStates(s,'gameEnd',true,true)
  }
  return s;
};

/**
 * Updates the grid and score by clearing filled rows and calculating new score.
 * @param s Current game state
 * @returns Updated game state with cleared rows and updated score
 */
const updateGridAndScore = (s: State): State => {
  const [newGrid, newColorGrid, newScore] = clearRowsAndScore(s.grid, s.colorGrid, s.score);
  
  // Create a new state with updated grid and score
  return {
    ...s,
    grid: newGrid,
    colorGrid: newColorGrid,
    score: newScore,
  };
};

/**
 * Updates the game level based on the player's score.
 * @param s Current game state
 * @returns Updated game state with adjusted level
 */
const updateLevel = (s: State): State => {
  const currentLevel = s.level;
  const thresholdForNextLevel = scoreThresholdForNextLevel(currentLevel);
  if (s.score >= thresholdForNextLevel) {
    const newLevel = currentLevel + 1;
    return updateStates(s, 'level', newLevel, true);
  }
  return s;
};

/**
 * Adjusts the game speed based on the player's performance.
 * @param s Current game state
 * @returns Updated game state with adjusted speed
 */
const updateSpeed = (s: State): State => {
  const numRowsClearedThisRound = Constants.GRID_HEIGHT - s.grid.filter(row => !rowIsFilled(row)).length;

  const newSpeed = numRowsClearedThisRound > 3
    ? Math.max(100, s.speed - 250)
    : s.speed;

  return {
    ...s,
    speed: newSpeed,
  };
};

/**
 * Clears filled rows from both grids and calculates the updated score.
 * @param grid Current grid state
 * @param colorGrid Current color grid state
 * @param score Current score
 * @returns Updated grid, color grid, and score
 */
const clearRowsAndScore = (grid: Grid, colorGrid: ColorGrid, score: number): [Grid, ColorGrid, number] => {
  const nonFilledRowIndices = grid.map((row, index) => ({ row, index }))
    .filter(({ row }) => !rowIsFilled(row))
    .map(({ index }) => index);
  
  const numRowsClearedThisRound = Constants.GRID_HEIGHT - nonFilledRowIndices.length;
  const newScore = score + (numRowsClearedThisRound * 100);
  
  // Create new grids with only non-filled rows
  const nonFilledRows = nonFilledRowIndices.map(index => grid[index]);
  const nonFilledColorRows = nonFilledRowIndices.map(index => colorGrid[index]);
  
  // Add empty rows at the top to maintain grid size
  const emptyRows = Array(numRowsClearedThisRound).fill(null).map(() => 
    Array(Constants.GRID_WIDTH).fill(false)
  );
  const emptyColorRows = Array(numRowsClearedThisRound).fill(null).map(() => 
    Array(Constants.GRID_WIDTH).fill(null)
  );

  // Create the new grids by adding empty rows at the top
  const updatedGrid = emptyRows.concat(nonFilledRows);
  const updatedColorGrid = emptyColorRows.concat(nonFilledColorRows);
  
  return [updatedGrid, updatedColorGrid, newScore];
};

/**
 * Checks if the game is lost by evaluating whether the first row of the grid is filled.
 * @param grid Current grid state
 * @returns True if the game is lost, false otherwise
 */
const gameLost = (grid: Grid): boolean => {
  return isFirstRowFilled(grid);
};

/**
 * Updates a property of the given state object conditionally.
 *
 * @template T - The type of the value to update the property with.
 * @param {State} state - The state object to update.
 * @param {keyof State} property - The property of the state object to update.
 * @param {T} value - The new value to set for the property.
 * @param {boolean} condition - If true, the property is updated; otherwise, the state remains unchanged.
 * @returns {State} - The updated state object.
 */
const updateStates = <T>(state: State, property: keyof State, value: T, condition: boolean): State =>
  condition ? { ...state, [property]: value } : state;

export { tick, initialState };
