/**
 * Type definitions used in the Tetris game.
 */
type Position = [number, number]; // Represents [row, column]

type Grid = boolean[][]; // Represents the grid of occupied cells

type ColorGrid = (string | null)[][]; // Represents the color of each cell (null for empty cells)

type Shape = boolean[][]; // Represents the shape of a tetromino

type Score = number; // Represents the player's score

type Color = string; // Represents the color of a tetromino

type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L'; // The 7 standard tetromino types

type Tetromino = {
  shape: Shape;
  type: TetrominoType;
  color: Color;
};

type Key = "KeyS" | "KeyA" | "KeyD"| "ArrowLeft"| "KeyZ"| "KeyY"| "Enter"; 

type Event = "keydown" | "keyup" | "keypress"; 

/**
 * The state of the Tetris game.
 */
type State = Readonly<{
  gameEnd: boolean; 
  currentPosition: Position; // The current position of the falling blocks
  score: Score; // The player's current score
  grid: Grid;
  colorGrid: ColorGrid; // Stores the color of each placed block
  currentTetromino: Tetromino; // The current falling tetromino
  nextTetromino: Tetromino; // The next tetromino
  level: number; // The current level of the game
  highScore: number; // The player's high score
  blockElements: SVGGraphicsElement[]; // SVG elements representing blocks
  speed: number; // The speed of the game in milliseconds per tick
  initialSpeed : number;
  gameStop : boolean;
}>;

export type {
  Position, Grid, ColorGrid, Shape, Score, Key, Event, State, Color, TetrominoType, Tetromino
};