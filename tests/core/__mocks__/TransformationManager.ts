import { vi } from 'vitest';
import { TransformMode } from '../TransformationManager.js';

const TransformationManager = vi.fn();

TransformationManager.prototype.enterMoveMode = vi.fn();
TransformationManager.prototype.enterRotateMode = vi.fn();
TransformationManager.prototype.enterMirrorMode = vi.fn();
TransformationManager.prototype.enterJiggleMode = vi.fn();
TransformationManager.prototype.start = vi.fn();
TransformationManager.prototype.exitCurrentMode = vi.fn();
TransformationManager.prototype.isTransforming = vi.fn().mockReturnValue(false);
TransformationManager.prototype.getCurrentMode = vi.fn().mockReturnValue(TransformMode.IDLE);
TransformationManager.prototype.transform = vi.fn();
TransformationManager.prototype.end = vi.fn();
TransformationManager.prototype.destroy = vi.fn();

export { TransformationManager, TransformMode };
