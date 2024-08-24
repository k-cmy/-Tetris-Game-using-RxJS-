
/**
 * Type definitions used in the Tetris game.
 */
type Position = [number, number]; // Represents [row, column]

type Grid = boolean[][]; // Represents the grid of occupied cells

type Shape = boolean[][]; // Represents the shape of a tetromino

type Score = number; // Represents the player's score

type Color = string; // Represents the color of a tetromino

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
  shape: Shape; // The shape of the falling blocks
  level: number; // The current level of the game
  nextShape: Shape; // The shape of the next blocks
  highScore: number; // The player's high score
  color: Color; // The color of the falling blocks
  blockElements: SVGGraphicsElement[]; // SVG elements representing blocks
  speed: number; // The speed of the game in milliseconds per tick
  initialSpeed : number;
  gameStop : boolean;
}>;

export type {
  Position , Grid , Shape , Score, Key , Event ,State,Color
};