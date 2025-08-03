// Re-export everything from IconRegistry for backward compatibility
export { IconRegistry, type IconName, type IconOptions } from './IconRegistry.js';
import { IconRegistry } from './IconRegistry.js';

// Legacy compatibility exports
export const icons = {
  file: IconRegistry.getIcon('file'),
  addShape: IconRegistry.getIcon('addShape'),
  edit: IconRegistry.getIcon('edit'),
  background: IconRegistry.getIcon('background'),
  help: IconRegistry.getIcon('help'),
  delete: IconRegistry.getIcon('delete'),
  transform: IconRegistry.getIcon('transform'),
  random: IconRegistry.getIcon('random'),
  leaf: IconRegistry.getIcon('leaf'),
  triangle: IconRegistry.getIcon('triangle'),
};

export function getIcon(name: keyof typeof icons): string {
  return IconRegistry.getIcon(name as any);
}

export function createIconElement(name: keyof typeof icons, className = ''): HTMLElement {
  return IconRegistry.createContainer(name as any, { className });
}
