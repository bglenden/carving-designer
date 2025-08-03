/**
 * SubmenuButton - Standardized submenu button component
 * Provides consistent layout and styling for all submenu items
 */

import { IconRegistry, type IconName } from '../../assets/icons/index.js';

export interface SubmenuButtonConfig {
  id: string;
  iconName: IconName;
  label: string;
  tooltip?: string;
  action: () => void;
  variant?: 'default' | 'primary' | 'danger';
}

export interface SubmenuConfig {
  orientation: 'horizontal' | 'vertical';
  showLabels: boolean;
  showIcons: boolean;
  gap?: 'sm' | 'md' | 'lg';
  theme?: 'light' | 'dark';
}

export class SubmenuButton {
  private static readonly defaultConfig: SubmenuConfig = {
    orientation: 'vertical',
    showLabels: false,
    showIcons: true,
    gap: 'sm',
    theme: 'dark',
  };

  /**
   * Create a standardized submenu container
   */
  static createSubmenu(
    parentElement: HTMLElement,
    buttons: SubmenuButtonConfig[],
    config: Partial<SubmenuConfig> = {},
  ): HTMLElement {
    const finalConfig = { ...this.defaultConfig, ...config };

    const submenu = document.createElement('div');
    submenu.className = this.getSubmenuClasses(finalConfig);

    buttons.forEach((buttonConfig) => {
      const button = this.createSubmenuButton(buttonConfig, finalConfig);
      submenu.appendChild(button);
    });

    parentElement.appendChild(submenu);
    return submenu;
  }

  /**
   * Create a single submenu button with consistent styling
   */
  static createSubmenuButton(
    config: SubmenuButtonConfig,
    submenuConfig: SubmenuConfig,
  ): HTMLButtonElement {
    const button = document.createElement('button');
    button.id = config.id;
    button.className = this.getButtonClasses(config.variant, submenuConfig);

    // Add accessibility attributes
    button.setAttribute('type', 'button');
    button.setAttribute('aria-label', config.tooltip || config.label);

    // Create button content container
    const content = document.createElement('div');
    content.className = 'flex items-center gap-2';

    // Add icon if enabled
    if (submenuConfig.showIcons) {
      const iconContainer = document.createElement('div');
      iconContainer.className = 'icon-container flex-shrink-0';
      const iconElement = IconRegistry.createElement(config.iconName, {
        size: 16,
        className: 'text-current',
      });
      iconContainer.appendChild(iconElement);
      content.appendChild(iconContainer);
    }

    // Add label if enabled
    if (submenuConfig.showLabels) {
      const label = document.createElement('span');
      label.className = 'text-sm font-medium';
      label.textContent = config.label;
      content.appendChild(label);
    }

    button.appendChild(content);

    // Add event handlers
    button.addEventListener('click', config.action);

    // Add keyboard support
    button.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        button.click();
      }
    });

    // Always add tooltip (essential when labels are hidden)
    button.title = config.tooltip || config.label;

    return button;
  }

  /**
   * Get CSS classes for the submenu container
   */
  private static getSubmenuClasses(config: SubmenuConfig): string {
    const baseClasses = ['absolute', 'rounded-md', 'shadow-lg', 'p-1', 'z-dropdown'];

    // Theme-based styling
    if (config.theme === 'dark') {
      baseClasses.push('bg-toolbar-bg', 'border', 'border-toolbar-border');
    } else {
      baseClasses.push('bg-neutral-0', 'border', 'border-neutral-200');
    }

    // Layout direction
    if (config.orientation === 'horizontal') {
      baseClasses.push('flex', 'flex-row');
    } else {
      baseClasses.push('flex', 'flex-col');
      // Adjust min-width based on whether labels are shown
      if (config.showLabels) {
        baseClasses.push('min-w-32');
      } else {
        baseClasses.push('min-w-fit');
      }
    }

    // Gap size
    switch (config.gap) {
      case 'sm':
        baseClasses.push('gap-1');
        break;
      case 'md':
        baseClasses.push('gap-2');
        break;
      case 'lg':
        baseClasses.push('gap-3');
        break;
    }

    return baseClasses.join(' ');
  }

  /**
   * Get CSS classes for individual buttons
   */
  private static getButtonClasses(
    variant: SubmenuButtonConfig['variant'],
    submenuConfig: SubmenuConfig,
  ): string {
    const baseClasses = ['btn-design-system', 'interactive', 'focus-ring', 'text-left', 'w-full'];

    // Theme-based button styling
    if (submenuConfig.theme === 'dark') {
      baseClasses.push(
        'bg-transparent',
        'text-neutral-100',
        'hover:bg-toolbar-hover',
        'hover:text-neutral-0',
        'active:bg-toolbar-active',
      );
    } else {
      baseClasses.push(
        'bg-transparent',
        'text-neutral-700',
        'hover:bg-neutral-100',
        'hover:text-neutral-900',
        'active:bg-neutral-200',
      );
    }

    // Variant-specific styling
    switch (variant) {
      case 'primary':
        if (submenuConfig.theme === 'dark') {
          baseClasses.push('text-brand-400', 'hover:text-brand-300', 'hover:bg-brand-900');
        } else {
          baseClasses.push('text-brand-600', 'hover:text-brand-700', 'hover:bg-brand-50');
        }
        break;
      case 'danger':
        if (submenuConfig.theme === 'dark') {
          baseClasses.push('text-error-400', 'hover:text-error-300', 'hover:bg-error-900');
        } else {
          baseClasses.push('text-error-600', 'hover:text-error-700', 'hover:bg-error-50');
        }
        break;
    }

    // Layout-specific adjustments
    if (!submenuConfig.showLabels) {
      // Compact layout without labels
      baseClasses.push('min-w-10', 'h-10', 'justify-center', 'px-2', 'py-2');
    } else if (submenuConfig.orientation === 'vertical') {
      baseClasses.push('justify-start', 'px-3', 'py-2');
    } else {
      baseClasses.push('justify-center', 'px-3', 'py-2');
    }

    return baseClasses.join(' ');
  }

  /**
   * Update button state (active/inactive)
   */
  static setButtonActive(button: HTMLButtonElement, isActive: boolean): void {
    if (isActive) {
      // Use brand blue background with white text for dark theme compatibility
      button.classList.add('bg-brand-500', 'text-white');
      button.classList.remove('bg-transparent', 'text-neutral-100', 'hover:bg-toolbar-hover');
      button.setAttribute('aria-pressed', 'true');
    } else {
      // Return to normal dark theme styling
      button.classList.remove('bg-brand-500', 'text-white');
      button.classList.add('bg-transparent', 'text-neutral-100', 'hover:bg-toolbar-hover');
      button.setAttribute('aria-pressed', 'false');
    }
  }

  /**
   * Position submenu relative to trigger button
   */
  static positionSubmenu(
    submenu: HTMLElement,
    triggerButton: HTMLElement,
    position: 'below' | 'right' | 'left' = 'below',
  ): void {
    const rect = triggerButton.getBoundingClientRect();

    switch (position) {
      case 'below':
        submenu.style.top = `${rect.bottom + 4}px`;
        submenu.style.left = `${rect.left}px`;
        break;
      case 'right':
        submenu.style.top = `${rect.top}px`;
        submenu.style.left = `${rect.right + 4}px`;
        break;
      case 'left':
        submenu.style.top = `${rect.top}px`;
        submenu.style.right = `${window.innerWidth - rect.left + 4}px`;
        break;
    }
  }
}
