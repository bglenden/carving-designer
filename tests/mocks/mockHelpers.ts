import { mockCanvasElement } from './mockManagers';
import { ToolbarManager } from '../../src/ui/ToolbarManager.js';
import { TransformMode } from '../../src/core/TransformationManager.js';

/**
 * createMockCanvas – returns a <canvas> element with the shared mockCanvasElement
 * behaviour mixed in.
 */
export function createMockCanvas(id = 'main-canvas'): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.id = id;
  // Merge our common stubbed methods/properties
  Object.assign(canvas, mockCanvasElement);
  return canvas as HTMLCanvasElement;
}

/**
 * buildStatusBarDOM – inserts status-bar + coordinate-display elements.
 */
export function buildStatusBarDOM() {
  const statusBar = document.createElement('div');
  statusBar.id = 'status-bar';
  const coordinateDisplay = document.createElement('div');
  coordinateDisplay.id = 'coordinate-display';

  document.body.append(statusBar, coordinateDisplay);

  return {
    statusBar,
    coordinateDisplay,
    cleanup() {
      statusBar.remove();
      coordinateDisplay.remove();
    },
  } as const;
}

/**
 * buildToolbarDOM – inserts the primary-toolbar element.
 */
export function buildToolbarDOM() {
  const primaryToolbar = document.createElement('div');
  primaryToolbar.id = 'primary-toolbar';
  document.body.appendChild(primaryToolbar);

  return {
    primaryToolbar,
    cleanup() {
      primaryToolbar.remove();
    },
  } as const;
}

interface CallbackOptions {
  loadDesign?: () => void;
  saveDesign?: () => void;
  saveAsDesign?: () => void;
  togglePlacement?: () => void;
  createShape?: (shape: string) => void;
  toggleEditMode?: () => void;
  move?: () => void;
  rotate?: () => void;
  mirror?: () => void;
  jiggle?: () => void;
}

/**
 * setupToolbarManager – One-stop helper: sets up minimal DOM, canvas, instantiates
 * ToolbarManager, wires optional callback spies, and returns teardown util.
 */
export function setupToolbarManager(callbacks: CallbackOptions = {}) {
  // DOM fixtures
  const { primaryToolbar, cleanup: cleanupToolbar } = buildToolbarDOM();
  const { cleanup: cleanupStatus } = buildStatusBarDOM();
  const canvas = createMockCanvas();
  document.body.appendChild(canvas);

  // Keep document.getElementById simple: rely on the real DOM tree.
  // Instantiate manager (it will create secondary & edit toolbars internally)
  const manager = new ToolbarManager();

  // Wire optional callbacks
  if (callbacks.loadDesign) manager.setLoadDesignCallback(callbacks.loadDesign);
  if (callbacks.saveDesign) manager.setSaveDesignCallback(callbacks.saveDesign);
  if (callbacks.saveAsDesign) manager.setSaveAsDesignCallback(callbacks.saveAsDesign);
  if (callbacks.togglePlacement) manager.setTogglePlacementCallback(callbacks.togglePlacement);
  if (callbacks.createShape) manager.setCreateShapeCallback(callbacks.createShape as any);
  if (callbacks.toggleEditMode) manager.setToggleEditModeCallback(callbacks.toggleEditMode);
  if (callbacks.move) manager.setMoveCallback(callbacks.move);
  if (callbacks.rotate) manager.setRotateCallback(callbacks.rotate);
  if (callbacks.mirror) manager.setMirrorCallback(callbacks.mirror);
  if (callbacks.jiggle) manager.setJiggleCallback(callbacks.jiggle);

  // Provide teardown to keep tests isolated
  function cleanup() {
    manager.destroy();
    canvas.remove();
    cleanupToolbar();
    cleanupStatus();
  }

  return {
    manager,
    primaryToolbar,
    canvas,
    cleanup,
  } as const;
}

/* --------------------------------------------------
 * Event dispatch helpers – syntactic sugar for tests
 * -------------------------------------------------- */
export function dispatchPlacementChange(active: boolean, shape: string | null = null) {
  document.dispatchEvent(
    new CustomEvent('placementModeChanged', {
      detail: {
        active,
        shape,
      },
    }),
  );
}

export function dispatchEditModeChange(active: boolean) {
  document.dispatchEvent(new CustomEvent('editModeChanged', { detail: { active } }));
}

export function dispatchTransformModeChange(mode: TransformMode) {
  document.dispatchEvent(new CustomEvent('transformModeChanged', { detail: { mode } }));
}
