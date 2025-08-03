import { vi } from 'vitest';

const ToolbarManager = vi.fn();

ToolbarManager.prototype.setLoadDesignCallback = vi.fn();
ToolbarManager.prototype.setSaveDesignCallback = vi.fn();
ToolbarManager.prototype.setSaveAsDesignCallback = vi.fn();
ToolbarManager.prototype.setCreateShapeCallback = vi.fn();
ToolbarManager.prototype.setTogglePlacementCallback = vi.fn();
ToolbarManager.prototype.setToggleEditModeCallback = vi.fn();
ToolbarManager.prototype.setMoveCallback = vi.fn();
ToolbarManager.prototype.setRotateCallback = vi.fn();
ToolbarManager.prototype.setMirrorCallback = vi.fn();
ToolbarManager.prototype.setJiggleCallback = vi.fn();
ToolbarManager.prototype.setDuplicateCallback = vi.fn();
ToolbarManager.prototype.setDeleteAllCallback = vi.fn();
ToolbarManager.prototype.setToggleBackgroundModeCallback = vi.fn();
ToolbarManager.prototype.setLoadBackgroundImageCallback = vi.fn();
ToolbarManager.prototype.setCalibrateImageCallback = vi.fn();
ToolbarManager.prototype.setBackgroundOpacityCallback = vi.fn();
ToolbarManager.prototype.getCurrentTransformMode = vi.fn();
ToolbarManager.prototype.destroy = vi.fn();
ToolbarManager.prototype.closeFileMenu = vi.fn();
ToolbarManager.prototype.toggleFileMenu = vi.fn();
ToolbarManager.prototype.getFileMenu = vi.fn();

export { ToolbarManager };
