import { vi, describe, beforeEach, it, expect } from 'vitest';
import {
  BackgroundImageHandler,
  BackgroundImageMode,
} from '../../src/background/BackgroundImageHandler.js';
import { BackgroundImageManager } from '../../src/background/BackgroundImageManager.js';
import { CanvasManager } from '../../src/canvas/CanvasManager.js';

// Mock dependencies
const createMockBackgroundImageManager = () => {
  const mockImage = { scaleFromTwoPoints: vi.fn() };
  return {
    getSelectedImage: vi.fn(() => mockImage),
    getImages: vi.fn(() => [mockImage]), // Return the mock image in the array
    setSelectedImage: vi.fn(),
    clearSelection: vi.fn(),
    hitTest: vi.fn(() => ({ image: null, hitResult: { region: 'NONE' } })),
    addImage: vi.fn(),
  };
};

const createMockCanvasManager = () => ({
  render: vi.fn(),
  getCanvas: vi.fn(() => ({
    getBoundingClientRect: () => ({ width: 800, height: 600 }),
    style: { cursor: 'default' },
  })),
  getCanvasWorldBounds: vi.fn(() => ({ width: 120, height: 100 })),
});

// Mock global objects
global.document = {
  dispatchEvent: vi.fn(),
  getElementById: vi.fn(() => null),
  createElement: vi.fn(() => ({ click: vi.fn() })),
  body: { appendChild: vi.fn() },
} as any;

global.prompt = vi.fn();

describe('BackgroundImageHandler - Calibration with Enhanced Distance Parsing', () => {
  let handler: BackgroundImageHandler;
  let mockBackgroundImageManager: any;
  let mockCanvasManager: any;

  beforeEach(() => {
    mockBackgroundImageManager = createMockBackgroundImageManager();
    mockCanvasManager = createMockCanvasManager();

    handler = new BackgroundImageHandler(mockBackgroundImageManager, mockCanvasManager);

    // Set up calibration mode with a selected image
    handler.setMode(BackgroundImageMode.CALIBRATING);

    vi.clearAllMocks();
  });

  const testDistanceInput = (input: string, expectedMM: number, description: string) => {
    it(`should parse ${description}: "${input}"`, () => {
      // Start calibration by adding two points
      handler.handleMouseDown({ x: 0, y: 0 }, 1);

      global.prompt = vi.fn(() => input);
      handler.handleMouseDown({ x: 10, y: 0 }, 1);

      // Get the mock image from the images array (same instance that calibratingImage references)
      const mockImage = mockBackgroundImageManager.getImages()[0];
      expect(mockImage.scaleFromTwoPoints).toHaveBeenCalledWith(
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        expectedMM,
      );

      // Should exit calibration mode on successful input
      expect(handler.getMode()).toBe(BackgroundImageMode.NORMAL);
    });
  };

  describe('Millimeter Formats', () => {
    testDistanceInput('25.4', 25.4, 'plain number as millimeters');
    testDistanceInput('25.4mm', 25.4, 'explicit millimeter units');
    testDistanceInput('25MM', 25, 'uppercase millimeter units');
    testDistanceInput('  25.4  mm  ', 25.4, 'millimeters with extra whitespace');
    testDistanceInput('100', 100, 'integer millimeters');
  });

  describe('Inch Formats', () => {
    testDistanceInput('1"', 25.4, 'decimal inches with double quote');
    testDistanceInput('1in', 25.4, 'decimal inches with "in" suffix');
    testDistanceInput('1inch', 25.4, 'decimal inches with "inch" suffix');
    testDistanceInput('12.5"', 12.5 * 25.4, 'decimal inches with decimal places');
    testDistanceInput('0.5"', 0.5 * 25.4, 'fractional decimal inches');
  });

  describe('Fraction Formats', () => {
    testDistanceInput('1/2"', (1 / 2) * 25.4, 'simple fraction with double quote');
    testDistanceInput('7/16"', (7 / 16) * 25.4, 'complex fraction with double quote');
    testDistanceInput('7/16in', (7 / 16) * 25.4, 'fraction with "in" suffix');
    testDistanceInput('7/16', (7 / 16) * 25.4, 'fraction without units (assumed inches)');
    testDistanceInput('1/64"', (1 / 64) * 25.4, 'very small fraction');
  });

  describe('Mixed Number Formats', () => {
    testDistanceInput('3 3/8"', (3 + 3 / 8) * 25.4, 'mixed number with double quote');
    testDistanceInput('3 3/8in', (3 + 3 / 8) * 25.4, 'mixed number with "in" suffix');
    testDistanceInput('3 3/8', (3 + 3 / 8) * 25.4, 'mixed number without units (assumed inches)');
    testDistanceInput('15 7/32"', (15 + 7 / 32) * 25.4, 'complex mixed number');
    testDistanceInput('  3   3/8  "  ', (3 + 3 / 8) * 25.4, 'mixed number with extra whitespace');
  });

  describe('Error Handling', () => {
    it('should reject invalid input and show error message', () => {
      handler.handleMouseDown({ x: 0, y: 0 }, 1);

      global.prompt = vi.fn(() => 'invalid input');
      handler.handleMouseDown({ x: 10, y: 0 }, 1);

      // Should show error message
      expect(document.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'showStatus',
          detail: expect.objectContaining({
            isError: true,
            message: expect.stringContaining('Invalid distance format'),
          }),
        }),
      );

      // Should stay in calibration mode
      expect(handler.getMode()).toBe(BackgroundImageMode.CALIBRATING);

      // Should not call scaleFromTwoPoints
      const mockImage = mockBackgroundImageManager.getSelectedImage();
      expect(mockImage.scaleFromTwoPoints).not.toHaveBeenCalled();
    });

    it('should reject negative values', () => {
      handler.handleMouseDown({ x: 0, y: 0 }, 1);

      global.prompt = vi.fn(() => '-5mm');
      handler.handleMouseDown({ x: 10, y: 0 }, 1);

      expect(document.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'showStatus',
          detail: expect.objectContaining({
            isError: true,
          }),
        }),
      );
      expect(handler.getMode()).toBe(BackgroundImageMode.CALIBRATING);
    });

    it('should reject zero values', () => {
      handler.handleMouseDown({ x: 0, y: 0 }, 1);

      global.prompt = vi.fn(() => '0');
      handler.handleMouseDown({ x: 10, y: 0 }, 1);

      expect(document.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'showStatus',
          detail: expect.objectContaining({
            isError: true,
          }),
        }),
      );
      expect(handler.getMode()).toBe(BackgroundImageMode.CALIBRATING);
    });

    it('should handle cancelled input gracefully', () => {
      handler.handleMouseDown({ x: 0, y: 0 }, 1);

      global.prompt = vi.fn(() => null); // User cancelled
      handler.handleMouseDown({ x: 10, y: 0 }, 1);

      // Should exit calibration mode normally
      expect(handler.getMode()).toBe(BackgroundImageMode.NORMAL);

      // Should not show error message
      expect(document.dispatchEvent).not.toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'showStatus',
          detail: expect.objectContaining({
            isError: true,
          }),
        }),
      );
    });
  });

  describe('Prompt Message', () => {
    it('should show helpful examples in the prompt', () => {
      handler.handleMouseDown({ x: 0, y: 0 }, 1);

      global.prompt = vi.fn(() => '25mm');
      handler.handleMouseDown({ x: 10, y: 0 }, 1);

      // Check that prompt was called with the message containing examples
      expect(global.prompt).toHaveBeenCalledWith(
        expect.stringContaining('Examples of accepted formats:'),
      );
      expect(global.prompt).toHaveBeenCalledWith(expect.stringContaining('25.4mm'));
      expect(global.prompt).toHaveBeenCalledWith(expect.stringContaining('1"'));
      expect(global.prompt).toHaveBeenCalledWith(expect.stringContaining('3 3/8"'));
      expect(global.prompt).toHaveBeenCalledWith(expect.stringContaining('7/16"'));
    });
  });

  describe('Edge Cases', () => {
    testDistanceInput('1/64"', (1 / 64) * 25.4, 'very small fraction');
    testDistanceInput('1000mm', 1000, 'large millimeter value');
    testDistanceInput('39.37"', 39.37 * 25.4, 'large inch value');

    it('should reject fractions with zero denominator', () => {
      handler.handleMouseDown({ x: 0, y: 0 }, 1);

      global.prompt = vi.fn(() => '3/0"');
      handler.handleMouseDown({ x: 10, y: 0 }, 1);

      expect(document.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'showStatus',
          detail: expect.objectContaining({
            isError: true,
          }),
        }),
      );
    });
  });
});
