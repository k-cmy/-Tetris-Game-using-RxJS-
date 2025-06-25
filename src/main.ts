/**
 * Inside this file you will use the classes and functions from rx.js
 * to add visuals to the svg element in index.html, animate them, and make them interactive.
 *
 * Study and complete the tasks in observable exercises first to get ideas.
 *
 * Course Notes showing Asteroids in FRP: https://tgdwyer.github.io/asteroids/
 *
 * You will be marked on your functional programming style
 * as well as the functionality that you implement.
 *
 * Document your code!
 */

/**
 * Entry point for the Tetris game. Initializes game loop and handles user input.
 */
import "./style.css";
import { BehaviorSubject, fromEvent, interval, merge } from "rxjs";
import { filter, map, scan, switchMap } from "rxjs/operators";
import { initialState, tick } from "./state";
import { render, renderNextShape, updateBlockElements } from "./view";
import { Key, State } from "./types";
import { rotateShape, emptyGrid, emptyColorGrid, getRandomTetromino, createTetromino } from "./util";

const key$ = fromEvent<KeyboardEvent>(document, "keydown");

const fromKey = (keyCode: Key) =>
  key$.pipe(filter(({ code }) => code === keyCode));

// Keyboard control Keys observables
const left$ = fromKey("KeyA");
const right$ = fromKey("KeyD");
const down$ = fromKey("KeyS");
const rotate$ = fromKey("ArrowLeft");
const stop$ = fromKey("KeyZ");
const resume$ = fromKey("KeyY");
const enter$ = fromKey("Enter");

/**
 * Creates and subscribes to the game loop and user input observables.
 */
export function main() {
  // Determine game tick rate and create an observable for game ticks
  const tickRate$ = new BehaviorSubject<number>(initialState.initialSpeed);
  const tick$ = tickRate$.pipe(switchMap(rate => interval(rate)));

  // create input observables with a type to identify 
  const moveLeft$ = left$.pipe(map(() => ({ type: 'MOVE_LEFT' })));
  const moveRight$ = right$.pipe(map(() => ({ type: 'MOVE_RIGHT' })));
  const moveDown$ = down$.pipe(map(() => ({ type: 'MOVE_DOWN' })));
  const rotateShape$ = rotate$.pipe(map(() => ({ type: 'ROTATE' })));
  const restartGame$ = enter$.pipe(map(() => ({ type: 'RESTART' })));
  const stopGame$ = stop$.pipe(map(() => ({ type: 'STOP' })));
  const resumeGame$ = resume$.pipe(map(() => ({ type: 'RESUME' })));
  const ticks$ = tick$.pipe(map(() => ({ type: 'TICK' })));

  // Combine user input observables and tick observable
  const actions$ = merge(moveDown$, moveLeft$, moveRight$, rotateShape$, restartGame$, stopGame$, resumeGame$, ticks$)

  const state$ = actions$.pipe(
    //processes user actions and updates state
    scan((state, action) => {
      const newState = (() => {
        switch (action.type) {
          case 'MOVE_LEFT':
            return moveLeft(state);
          case 'MOVE_RIGHT':
            return moveRight(state);
          case 'MOVE_DOWN':
            return moveDown(state);
          case 'ROTATE':
            return rotate(state);
          case 'RESTART':
            return restartGame(state);
          case 'TICK':
            return tick(state, [1, 0]);
          case 'STOP':
            return stopGame(state);
          case 'RESUME':
            return resumeGame(state);
          default:
            return state;
        }
      })();

      // Update tick rate based on speed
      if (newState.speed !== state.speed) { // when cleared row more than 3 rows
        tickRate$.next(newState.speed);
      }
      return newState;
    }, initialState)// use initialState as a start
  );

  state$.subscribe((state) => {// contain side effects 
    render(state);
    renderNextShape(state);
  });

  /**
   * Updates the game state based on a provided action if the game is not ended.
   *
   * @param state - The current game state.
   * @param action - A function that takes the current state and returns the updated state.
   * @returns The updated game state if the game is not ended; otherwise, the original state.
   */
  const updateState = (state: State, action: (state: State) => State): State =>
    !state.gameEnd ? action(state) : state;

  /**
   * Moves the shape of blocks to the left within the game grid.
   * @param state Current game state
   * @returns Updated game state after moving the shape of blocks left
   */
  const moveLeft = (state: State): State => {
    return updateState(state, (s) => tick(s, [0, -1]));
  };
  
  /**
   * Moves the shape of blocks to the right within the game grid.
   * @param state Current game state
   * @returns Updated game state after moving the shape of blocks right
   */
  const moveRight = (state: State): State => {
    return updateState(state, (s) => tick(s, [0, 1]));
  };

  /**
   * Moves the shape of blocks downward within the game grid.
   * @param state Current game state
   * @returns Updated game state after moving the shape of blocks down
   */
  const moveDown = (state: State): State => {
    return updateState(state, (s) => {
      const newState = tick(s, [1, 0]);
      const updatedStateWithScore = {
        ...newState,
        score: newState.score + 1,
      };
      return updatedStateWithScore;
    });
  };

  /**
   * Rotates the current tetromino shape clockwise.
   * @param state Current game state
   * @returns Updated game state after rotating the tetromino
   */
  const rotate = (state: State): State => {
    return updateState(state, (s) => {
      const rotatedShape = rotateShape(s.currentTetromino.shape);
      const rotatedTetromino = {
        ...s.currentTetromino,
        shape: rotatedShape
      };
      const newState = { ...s, currentTetromino: rotatedTetromino };
      return newState;
    });
  };

  /**
   * Stop the Game.
   * @param state Current game state
   * @returns Updated game state to stop the game.
   */
  const stopGame = (state: State): State => {
    return updateState(state, (s) => ({ ...s, gameStop: true }));
  };

  /**
   * Resume the Game.
   * @param state Current game state
   * @returns Updated game state to resume the game.
   */
  const resumeGame = (state: State): State => {
    return updateState(state, (s) => ({ ...s, gameStop: false }));
  };
  
  /**
   * Restarts the game after it has ended.
   * @param state Current game state
   * @returns Updated game state after restarting the game
   */
  const restartGame = (state: State): State => {
    if (state.gameEnd) {
      const newBlockElements = updateBlockElements(initialState);
      const newState = {
        ...initialState,
        gameEnd: false,
        highScore: Math.max(state.score, state.highScore), // get the highest score of the round that scores the highest
        score: 0,
        grid: emptyGrid(),
        colorGrid: emptyColorGrid(),
        currentTetromino: createTetromino('O'),
        nextTetromino: getRandomTetromino(),
        blockElements: newBlockElements,
      };
      return newState;
    }
    return state;
  };
}

/**
 * Initializes the game loop and user input handling upon page load.
 */
if (typeof window !== "undefined") {
  window.onload = () => {
    main();
  };
}