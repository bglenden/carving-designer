// PrimaryToolbar.ts: Contains setup logic for the primary toolbar only.
import { ToolbarButton } from './ToolbarButton.js';

export function setupPrimaryToolbar(
  primaryToolbar: HTMLElement,
  buttonConfigs: ToolbarButton[],
  createButton: (
    parent: HTMLElement,
    config: ToolbarButton,
    marginClass?: string,
  ) => HTMLButtonElement,
) {
  buttonConfigs.forEach((config) => {
    createButton(primaryToolbar, config);
  });
}
