import { beforeAll, afterAll, beforeEach, vi } from 'vitest';

// A mock for the canvas 2D rendering context that implements the real interface
class MockCanvasRenderingContext2D {
  canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  // Properties
  globalAlpha = 1;
  globalCompositeOperation: GlobalCompositeOperation = 'source-over';
  fillStyle: string | CanvasGradient | CanvasPattern = '#000000';
  strokeStyle: string | CanvasGradient | CanvasPattern = '#000000';
  lineWidth = 1;
  lineCap: CanvasLineCap = 'butt';
  lineJoin: CanvasLineJoin = 'miter';
  miterLimit = 10;
  lineDashOffset = 0;
  shadowBlur = 0;
  shadowColor = 'rgba(0, 0, 0, 0)';
  shadowOffsetX = 0;
  shadowOffsetY = 0;
  font = '10px sans-serif';
  textAlign: CanvasTextAlign = 'start';
  textBaseline: CanvasTextBaseline = 'alphabetic';
  direction: CanvasDirection = 'ltr';
  imageSmoothingEnabled = true;
  imageSmoothingQuality: ImageSmoothingQuality = 'low';
  filter = 'none';
  fontKerning: CanvasFontKerning = 'auto';
  fontStretch: CanvasFontStretch = 'normal';
  fontVariantCaps: CanvasFontVariantCaps = 'normal';
  letterSpacing = '0px';
  textRendering: CanvasTextRendering = 'auto';
  wordSpacing = '0px';
  transform = vi.fn();

  // --- Mocks for overloaded methods ---
  stroke = vi.fn();
  fill = vi.fn();
  clip = vi.fn();
  setTransform = vi.fn();
  drawImage = vi.fn();
  createImageData = vi.fn().mockImplementation(() => new ImageData(1, 1));
  putImageData = vi.fn();
  drawFocusIfNeeded = vi.fn();
  isPointInPath = vi.fn().mockImplementation(() => false);
  isPointInStroke = vi.fn().mockImplementation(() => false);

  // --- Standard method mocks ---
  save = vi.fn();
  restore = vi.fn();
  beginPath = vi.fn();
  moveTo = vi.fn();
  lineTo = vi.fn();
  closePath = vi.fn();
  clearRect = vi.fn();
  getTransform = vi.fn().mockImplementation(() => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }));
  fillRect = vi.fn();
  strokeRect = vi.fn();
  arc = vi.fn();
  arcTo = vi.fn();
  ellipse = vi.fn();
  bezierCurveTo = vi.fn();
  quadraticCurveTo = vi.fn();
  rect = vi.fn();
  roundRect = vi.fn();
  setLineDash = vi.fn();
  getLineDash = vi.fn().mockImplementation(() => []);
  measureText = vi.fn().mockImplementation(() => ({ width: 0 } as TextMetrics));
  fillText = vi.fn();
  strokeText = vi.fn();
  getImageData = vi.fn();
  createLinearGradient = vi.fn();
  createRadialGradient = vi.fn();
  createPattern = vi.fn();
  getContextAttributes = vi.fn();
  reset = vi.fn();
  resetTransform = vi.fn();
  rotate = vi.fn();
  scale = vi.fn();
  translate = vi.fn();
  isContextLost = vi.fn().mockImplementation(() => false);
  createConicGradient = vi.fn();
}

// A mock for the Touch class that implements the real interface
class MockTouch implements Touch {
  identifier: number;
  target: EventTarget;
  clientX: number;
  clientY: number;
  pageX: number;
  pageY: number;
  screenX: number;
  screenY: number;
  radiusX: number;
  radiusY: number;
  rotationAngle: number;
  force: number;

  constructor(init: Partial<Touch>) {
    this.identifier = init.identifier ?? 0;
    this.target = init.target ?? new EventTarget();
    this.clientX = init.clientX ?? 0;
    this.clientY = init.clientY ?? 0;
    this.pageX = init.pageX ?? 0;
    this.pageY = init.pageY ?? 0;
    this.screenX = init.screenX ?? 0;
    this.screenY = init.screenY ?? 0;
    this.radiusX = init.radiusX ?? 2.5;
    this.radiusY = init.radiusY ?? 2.5;
    this.rotationAngle = init.rotationAngle ?? 0;
    this.force = init.force ?? 1;
  }
}

Object.assign(global, { Touch: MockTouch });

// ---------------------------------------------------------------------------
// Silence noisy console output (constructor logs, etc.) during tests
// ---------------------------------------------------------------------------
beforeAll(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'info').mockImplementation(() => {});
});

afterAll(() => {
  (console.log as any).mockRestore?.();
  (console.info as any).mockRestore?.();
});

const mockMediaQueryList: MediaQueryList = {
  matches: false,
  media: '',
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
};

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    ...mockMediaQueryList,
    media: query,
  })),
});

Object.defineProperty(window, 'showOpenFilePicker', {
  writable: true,
  value: vi.fn(),
});

Object.defineProperty(window, 'showSaveFilePicker', {
  writable: true,
  value: vi.fn(),
});

// Ensure a <canvas id="design-canvas"> element exists so that App can create
// a CanvasManager when tests instantiate it without injecting a mock.
beforeEach(() => {
  if (!document.getElementById('design-canvas')) {
    const canvas = document.createElement('canvas');
    canvas.id = 'design-canvas';
    // Insert at top so tests that later set innerHTML won't overwrite it
    document.body.appendChild(canvas);
  }
});

// Mock for getContext
beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (
    this: HTMLCanvasElement,
    contextId: string,
  ) {
    if (contextId === '2d') {
      return new MockCanvasRenderingContext2D(this) as unknown as CanvasRenderingContext2D;
    }
    return null;
  });
});

export function createMouseEvent(
  type: string,
  x: number,
  y: number,
  options: MouseEventInit = {},
): MouseEvent {
  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    clientX: x,
    clientY: y,
    button: 0, // Main button
    ...options,
  });
  return event;
}

// Helper to create a mock TouchEvent for testing touch interactions.
export const createTouchEvent = (
  type: string,
  touches: { clientX: number; clientY: number }[],
  target: EventTarget = document.createElement('canvas'),
): TouchEvent => {
  const touchMocks = touches.map((t) => ({
    ...t,
    identifier: Math.random(),
    target,
  }));

  const event = new Event(type, { bubbles: true, cancelable: true });

  Object.assign(event, {
    touches: touchMocks,
    targetTouches: touchMocks,
    changedTouches: touchMocks,
    preventDefault: vi.fn(),
  });

  return event as unknown as TouchEvent;
};
