/**
 * Module for rendering visual elements of the Tetris game.
 */
import { Block, Viewport } from './constants';
import { Color, State } from './types';

/** Rendering (side effects) */
/**
 * Displays a SVG element on the canvas. Brings to foreground.
 * @param elem SVG element to display
 */
const show = (elem: SVGGraphicsElement) => {
  // The element has a parent node and has been added to the DOM
  elem.setAttribute("visibility", "visible");
  elem.parentNode!.appendChild(elem);
};
  
/**
  * Hides a SVG element on the canvas.
  * @param elem SVG element to hide
*/
const hide = (elem: SVGGraphicsElement) =>{    
elem.setAttribute("visibility", "hidden");}

/**
 * Creates an SVG element with the given properties.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/SVG/Element for valid
 * element names and properties.
 *
 * @param namespace Namespace of the SVG element
 * @param name SVGElement name
 * @param props Properties to set on the SVG element
 * @returns SVG element
 */
const createSvgElement = (
  namespace: string | null,
  name: string,
  props: Record<string, string> = {}
) => {
  const elem = document.createElementNS(namespace, name) as SVGElement;
  Object.entries(props).forEach(([k, v]) => elem.setAttribute(k, v));
  return elem;
};

// DOM elements
const svg = document.querySelector("#svgCanvas") as SVGGraphicsElement & HTMLElement;
const preview = document.querySelector("#svgPreview") as SVGGraphicsElement &
  HTMLElement;
const gameover = document.querySelector("#gameOver") as SVGGraphicsElement &
  HTMLElement;
const container = document.querySelector("#main") as HTMLElement;

const gamestop = document.querySelector("#gameStop") as SVGGraphicsElement &
HTMLElement;

  // Text fields
  const levelText = document.querySelector("#levelText") as HTMLElement;
  const scoreText = document.querySelector("#scoreText") as HTMLElement;
  const highScoreText = document.querySelector("#highScoreText") as HTMLElement;

/**
 * Draws a block at the specified column and row with the given color.
 * @param column Column index
 * @param row Row index
 * @param colorOfBlocks Color of the block
 * @param svgElement SVG element to draw on
 * @returns SVGGraphicsElement representing the drawn block
 */
  const drawBlock = (
    column: number,
    row: number,
    colorOfBlocks: Color,
    svgElement: SVGGraphicsElement & HTMLElement
  ): SVGGraphicsElement => {
    const block = createSvgElement(svgElement.namespaceURI, "rect", {
      height: `${Block.HEIGHT}`,
      width: `${Block.WIDTH}`,
      x: `${column * Block.WIDTH}`,
      y: `${row * Block.HEIGHT}`,
      style: `fill: ${colorOfBlocks}; stroke: #000; stroke-width: 1; filter: drop-shadow(0 0 3px rgba(0,255,255,0.3));`,
      rx: "2", // Rounded corners for modern look
      ry: "2"
    }) as SVGGraphicsElement;
    svgElement.appendChild(block);
    return block;
  };

/**
 * Draws an empty cell at the specified column and row.
 * @param column Column index
 * @param row Row index
 */
const drawEmptyCell = (column: number, row: number) => {
  const emptyCell = createSvgElement(svg.namespaceURI, 'rect', {
    height: `${Block.HEIGHT}`,
    width: `${Block.WIDTH}`,
    x: `${column * Block.WIDTH}`,
    y: `${row * Block.HEIGHT}`,
    style: 'fill: rgba(255,255,255,0.02); stroke: rgba(255,255,255,0.1); stroke-width: 0.5;',
    rx: "1",
    ry: "1"
  });
  svg.appendChild(emptyCell);
  };

  /**
 * Updates the array of block elements representing the shape of blocks.
 * @param s Current game state
 * @returns Array of updated block elements
 */
const updateBlockElements = (s: State): SVGGraphicsElement[] => {
  const currentTetromino = s.currentTetromino; 
  const currentPosition = s.currentPosition; 

  // Generate new block elements based on the current tetromino, position, and color
  const newBlockElements = currentTetromino.shape.flatMap((row, rowIndex) =>
    row.flatMap((column, columnIndex) => {
      if (column) {
        const X = columnIndex + currentPosition[1];
        const Y = rowIndex + currentPosition[0];

        // Create a new block element with enhanced styling
        const block = createSvgElement(svg.namespaceURI, 'rect', {
          height: `${Block.HEIGHT}`,
          width: `${Block.WIDTH}`,
          x: `${X * Block.WIDTH}`,
          y: `${Y * Block.HEIGHT}`,
          style: `fill: ${currentTetromino.color}; stroke: #000; stroke-width: 1; filter: drop-shadow(0 0 3px rgba(0,255,255,0.3));`,
          rx: "2",
          ry: "2"
        }) as SVGGraphicsElement;
        return [block]; // Add the new block element to the array
      }
      return [];
    })
  );
  return newBlockElements;
};

  /**
 * Renders the current state to the canvas.
 *
 * In MVC terms, this updates the View using the Model.
 *
 * @param s Current state
 */
  const render = (s: State) => {
    // Clear the SVG canvas before rendering
    svg.innerHTML = '';

    svg.setAttribute("height", `${Viewport.CANVAS_HEIGHT}`);
    svg.setAttribute("width", `${Viewport.CANVAS_WIDTH}`);
    preview.setAttribute("height", `${Viewport.PREVIEW_HEIGHT}`);
    preview.setAttribute("width", `${Viewport.PREVIEW_WIDTH}`);
  
   // Draw blocks for occupied cells in the grid using stored colors
    s.grid.forEach((row, rowIndex) => {
      row.forEach((column, columnIndex) => {
        if (column) {
          // Use the color from the color grid for placed blocks
          const blockColor = s.colorGrid[rowIndex][columnIndex] || '#FFFFFF';
          drawBlock(columnIndex, rowIndex, blockColor, svg);
        } else {
          drawEmptyCell(columnIndex, rowIndex);
        }
      });
    });
  
    // Draw blocks for the current tetromino with enhanced styling
    s.currentTetromino.shape.forEach((row, rowIndex) => {
      row.forEach((column, columnIndex) => {
        if (column) {
          const X = columnIndex + s.currentPosition[1];
          const Y = rowIndex + s.currentPosition[0];
          const activeBlock = createSvgElement(svg.namespaceURI, "rect", {
            height: `${Block.HEIGHT}`,
            width: `${Block.WIDTH}`,
            x: `${X * Block.WIDTH}`,
            y: `${Y * Block.HEIGHT}`,
            style: `fill: ${s.currentTetromino.color}; stroke: #fff; stroke-width: 2; filter: drop-shadow(0 0 5px ${s.currentTetromino.color});`,
            rx: "2",
            ry: "2"
          }) as SVGGraphicsElement;
          svg.appendChild(activeBlock);
        }
      });
    });
  
    // Update text fields
    levelText.textContent = `${s.level}`;
    scoreText.textContent = `${s.score}`;
    highScoreText.textContent = `${s.highScore}`;
  
    // Show or hide game over message
s.gameEnd ? (svg.appendChild(gameover), show(gameover)) : hide(gameover);

// Show or hide game stop message
s.gameStop ? (svg.appendChild(gamestop), show(gamestop)) : hide(gamestop);

  };
/**
 * Renders the next tetromino preview on the preview canvas.
 * @param s Current game state
 */   
const renderNextShape = (s: State) => {
  // Clear the preview SVG canvas before rendering
  preview.innerHTML = "";

  const nextTetromino = s.nextTetromino;

  // Calculate centering offset for the preview with larger blocks
  const shapeWidth = nextTetromino.shape[0] ? nextTetromino.shape[0].length : 0;
  const shapeHeight = nextTetromino.shape.length;
  const blockSize = Block.WIDTH * 0.6; // Use 60% of block size for preview
  const previewWidth = 120; // Available preview area width
  const previewHeight = 120; // Available preview area height
  
  const totalShapeWidth = shapeWidth * blockSize;
  const totalShapeHeight = shapeHeight * blockSize;
  const offsetX = (previewWidth - totalShapeWidth) / 2;
  const offsetY = (previewHeight - totalShapeHeight) / 2;

  nextTetromino.shape.forEach((row, rowIndex) => {
    row.forEach((column, columnIndex) => {
      if (column) {
        const previewBlock = createSvgElement(preview.namespaceURI, "rect", {
          height: `${blockSize}`,
          width: `${blockSize}`,
          x: `${columnIndex * blockSize + offsetX}`,
          y: `${rowIndex * blockSize + offsetY}`,
          style: `fill: ${nextTetromino.color}; stroke: #000; stroke-width: 1; filter: drop-shadow(0 0 2px ${nextTetromino.color});`,
          rx: "2",
          ry: "2"
        }) as SVGGraphicsElement;
        preview.appendChild(previewBlock);
      }
    });
  });
};

export{render,renderNextShape,updateBlockElements}