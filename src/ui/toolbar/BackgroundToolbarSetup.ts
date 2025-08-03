import { CallbackManager } from './CallbackManager.js';
import { ToolbarElements } from './ToolbarSetup.js';
import { SubmenuButton, type SubmenuButtonConfig } from '../components/SubmenuButton.js';

export class BackgroundToolbarSetup {
  public static setup(
    primaryToolbar: HTMLElement,
    callbackManager: CallbackManager,
    elements: ToolbarElements,
  ): void {
    // Define background actions with proper labels and improved icons
    const backgroundActions: SubmenuButtonConfig[] = [
      {
        id: 'load-image-btn',
        iconName: 'background',
        label: 'Load Image',
        tooltip: 'Load background image from file',
        action: () => callbackManager.loadBackgroundImageCallback?.(),
      },
      {
        id: 'calibrate-btn',
        iconName: 'calibrate',
        label: 'Calibrate',
        tooltip: 'Calibrate image size and position',
        action: () => callbackManager.calibrateImageCallback?.(),
      },
    ];

    // Create standardized submenu with compact dark layout (tooltips on hover)
    elements.backgroundToolbar = SubmenuButton.createSubmenu(primaryToolbar, backgroundActions, {
      orientation: 'vertical',
      showLabels: false,
      showIcons: true,
      gap: 'sm',
      theme: 'dark',
    });

    elements.backgroundToolbar.id = 'background-toolbar';
    elements.backgroundToolbar.style.display = 'none';

    // Position the menu to the right of the background button
    elements.backgroundToolbar.classList.add('left-full', 'top-0', 'ml-2');

    // Create opacity slider container and add it to the submenu
    const opacityContainer = document.createElement('div');
    opacityContainer.className =
      'flex flex-col gap-1 px-3 py-2 border-t border-toolbar-border mt-1';

    const opacityLabel = document.createElement('label');
    opacityLabel.textContent = 'Opacity';
    opacityLabel.className = 'text-xs font-medium text-neutral-300';

    const opacitySlider = document.createElement('input');
    opacitySlider.type = 'range';
    opacitySlider.id = 'opacity-slider';
    opacitySlider.min = '0';
    opacitySlider.max = '100';
    opacitySlider.value = '50';
    opacitySlider.className = 'w-24 accent-brand-500';
    opacitySlider.addEventListener('input', (e) => {
      const value = parseFloat((e.target as HTMLInputElement).value) / 100;
      callbackManager.backgroundOpacityCallback?.(value);
    });

    opacityContainer.appendChild(opacityLabel);
    opacityContainer.appendChild(opacitySlider);
    elements.backgroundToolbar.appendChild(opacityContainer);

    elements.loadImageBtn = elements.backgroundToolbar.querySelector(
      '#load-image-btn',
    ) as HTMLButtonElement;
    elements.calibrateBtn = elements.backgroundToolbar.querySelector(
      '#calibrate-btn',
    ) as HTMLButtonElement;
    elements.opacitySlider = opacitySlider;
  }
}
