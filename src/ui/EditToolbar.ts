// EditToolbar.ts: Contains setup logic for the edit toolbar only.
import { ToolbarButton } from './ToolbarButton.js';

export function setupEditToolbar(
  editToolbar: HTMLElement,
  buttonConfigs: ToolbarButton[],
  createButton: (
    parent: HTMLElement,
    config: ToolbarButton,
    marginClass?: string,
  ) => HTMLButtonElement,
) {
  buttonConfigs.forEach((config) => {
    createButton(editToolbar, config);
  });
}
