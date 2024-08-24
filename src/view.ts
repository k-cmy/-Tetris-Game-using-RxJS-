/**
 * Module for rendering visual elements of the Tetris game.
 */
import { Block,  Viewport } from './constants';
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
        style: `fill: ${colorOfBlocks}`,
      }) as SVGGraphicsElement;
      svgElement.appendChild(block);
      return block;
    };
/**
 * Draws an empty cell at the specified column and row.
 * @param column Column index
 * @param row Row index
 */
  const drawEmptyCell = (column: number, row: number) => {// show the grid's cell shapes
    const emptyCell = createSvgElement(svg.namespaceURI, 'rect', {
      height: `${Block.HEIGHT}`,
      width: `${Block.WIDTH}`,
      x: `${column * Block.WIDTH}`,
      y: `${row * Block.HEIGHT}`,
      style: 'fill: none; stroke: gray; stroke-width: 1;',
    });
    svg.appendChild(emptyCell);
    };

    /**
 * Updates the array of block elements representing the shape of blocks.
 * @param s Current game state
 * @returns Array of updated block elements
 */
const updateBlockElements = (s: State): SVGGraphicsElement[] => {
  const currentShape = s.shape; 
  const color = s.color; 
  const currentPosition = s.currentPosition; 

  // Generate new block elements based on the current shape, position, and color
  const newBlockElements = currentShape.flatMap((row, rowIndex) =>
    row.flatMap((column, columnIndex) => {
      if (column) {
        const X = columnIndex + currentPosition[1];
        const Y = rowIndex + currentPosition[0];

        // Create a new block element
        const block = createSvgElement(svg.namespaceURI, 'rect', {
          height: `${Block.HEIGHT}`,
          width: `${Block.WIDTH}`,
          x: `${X * Block.WIDTH}`,
          y: `${Y * Block.HEIGHT}`,
          style: `fill: ${color}`,
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
    
     // Draw blocks for occupied cells in the grid
s.grid.forEach((row, rowIndex) => {
  row.forEach((column, columnIndex) => {
    column ? drawBlock(columnIndex, rowIndex, s.color, svg) : drawEmptyCell(columnIndex, rowIndex);
  });
});

    
      // Draw blocks for the current shape of blocks
      s.shape.forEach((row, rowIndex) => {
        row.forEach((column, columnIndex) => {
          if (column) {
            const X = columnIndex + s.currentPosition[1];
            const Y = rowIndex + s.currentPosition[0];
            drawBlock(X, Y, s.color, svg);
          }
        });
      });
    
      // Update text fields
      levelText.textContent = `${s.level}`;
      scoreText.textContent = ` ${s.score}`;
      highScoreText.textContent = `${s.highScore}`;
    
      // Show or hide game over message
s.gameEnd ? (svg.appendChild(gameover), show(gameover)) : hide(gameover);

// Show or hide game stop message
s.gameStop ? (svg.appendChild(gamestop), show(gamestop)) : hide(gamestop);

    };
/**
 * Renders the next shape preview on the preview canvas.
 * @param s Current game state
 */   
const renderNextShape = (s: State) => {
  // Clear the preview SVG canvas before rendering
  preview.innerHTML = "";

  const nextShape = s.nextShape;
  const color = s.color;

  nextShape.forEach((row, rowIndex) => {
    row.forEach((column, columnIndex) => {
      if (column) {
        drawBlock(columnIndex, rowIndex, color, preview);
      }
    });
  });
};

  export{render,renderNextShape,updateBlockElements}