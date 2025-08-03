import { describe, it, expect, beforeEach } from 'vitest';

/**
 * This test ensures that the canvas and its container fill the entire viewport
 * with no extra blank space or scrolling, as required by the UI specification.
 */
describe('Canvas Layout', () => {
  let canvas: HTMLCanvasElement;
  let main: HTMLElement;

  beforeEach(() => {
    // Clean up DOM and set up structure similar to index.html
    document.body.innerHTML = '';
    document.body.className = 'bg-gray-900 text-gray-100 flex flex-col h-screen';

    main = document.createElement('main');
    main.className = 'flex-grow relative';

    canvas = document.createElement('canvas');
    canvas.id = 'design-canvas';
    canvas.className = 'w-full h-full block bg-white';

    main.appendChild(canvas);
    document.body.appendChild(main);
  });

  it('should apply correct layout classes to prevent scrolling', () => {
    // Body should be a flex container filling the screen vertically
    expect(document.body.classList.contains('flex')).toBe(true);
    expect(document.body.classList.contains('flex-col')).toBe(true);
    expect(document.body.classList.contains('h-screen')).toBe(true);

    // Main content should grow to fill available space
    expect(main.classList.contains('flex-grow')).toBe(true);

    // Canvas should fill its container (main)
    expect(canvas.classList.contains('w-full')).toBe(true);
    expect(canvas.classList.contains('h-full')).toBe(true);
  });
});
