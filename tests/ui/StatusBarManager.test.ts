import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { StatusBarManager } from '../../src/ui/StatusBarManager.js';
import { PlacementState } from '../../src/core/PlacementManager.js';
import { Point } from '../../src/core/types.js';
import { CanvasMouseMoveEvent } from '../../src/core/events.js';

vi.unmock('../../src/ui/StatusBarManager.js');

describe('StatusBarManager', () => {
  let statusBar: HTMLElement;
  let coordinateDisplay: HTMLElement;
  let statusBarManager: StatusBarManager;

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="status-bar"></div>
      <div id="coordinate-display"></div>
    `;
    statusBar = document.getElementById('status-bar')!;
    coordinateDisplay = document.getElementById('coordinate-display')!;
    statusBarManager = new StatusBarManager();
  });

  afterEach(() => {
    statusBarManager.destroy();
    document.body.innerHTML = '';
    vi.useRealTimers();
  });

  it('should show a status message and then hide it after a timeout', () => {
    vi.useFakeTimers();
    statusBarManager.showStatusMessage('Test message', 1000);
    expect(statusBar.textContent).toBe('Test message');
    expect(statusBar.style.display).toBe('block');

    vi.advanceTimersByTime(1000);
    expect(statusBar.style.display).toBe('none');
    expect(statusBar.textContent).toBe('');
  });

  it('should update placement status message', () => {
    statusBarManager.updatePlacementStatus(PlacementState.PLACING);
    expect(statusBar.textContent).toBe('Click and drag to place the shape (Esc to cancel)');
    expect(statusBar.style.display).toBe('block');

    statusBarManager.updatePlacementStatus(PlacementState.IDLE);
    expect(statusBar.style.display).toBe('none');
  });

  it('should hide the status bar', () => {
    statusBar.textContent = 'Some message';
    statusBar.style.display = 'block';

    statusBarManager.hideStatus();
    expect(statusBar.style.display).toBe('none');
    expect(statusBar.textContent).toBe('');
  });

  it('should update coordinate display on canvas mouse move', () => {
    const pos: Point = { x: 12.345, y: 67.89 };
    const event = new CanvasMouseMoveEvent(pos);
    document.dispatchEvent(event);

    expect(coordinateDisplay.textContent).toBe('X: 12.3mm, Y: 67.9mm');
  });

  it('should handle missing status bar gracefully when showing a message', () => {
    document.body.innerHTML = '';
    const managerWithNoStatus = new StatusBarManager();
    expect(() => managerWithNoStatus.showStatusMessage('Test')).not.toThrow();
  });

  it('should handle missing status bar gracefully when updating placement status', () => {
    document.body.innerHTML = '';
    const managerWithNoStatus = new StatusBarManager();
    expect(() => managerWithNoStatus.updatePlacementStatus(PlacementState.PLACING)).not.toThrow();
  });
});
