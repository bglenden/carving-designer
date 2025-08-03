// SecondaryToolbar.ts: Contains setup logic for the secondary toolbar only.
import { ToolbarButton } from './ToolbarButton.js';

export function setupSecondaryToolbar(
  secondaryToolbar: HTMLElement,
  buttonConfigs: ToolbarButton[],
  createButton: (
    parent: HTMLElement,
    config: ToolbarButton,
    marginClass?: string,
  ) => HTMLButtonElement,
) {
  buttonConfigs.forEach((config) => {
    createButton(secondaryToolbar, config);
  });
}
