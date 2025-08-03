import { ToolbarButton } from '../ToolbarButton.js';
import { IconRegistry, type IconName } from '../../assets/icons/index.js';

export function createButton(
  parent: HTMLElement,
  config: ToolbarButton,
  marginClass?: string,
): HTMLButtonElement {
  const button = document.createElement('button');
  button.id = config.id;

  // Use enhanced button styling with design tokens
  button.className = `btn-enhanced interactive ${marginClass || ''}`;

  // Create icon container
  const iconContainer = document.createElement('div');
  iconContainer.className = 'icon-container';

  // Use IconRegistry for consistent icon rendering
  if (config.iconName && IconRegistry.hasIcon(config.iconName as IconName)) {
    const iconElement = IconRegistry.createElement(config.iconName as IconName, {
      size: 20,
      className: 'text-current',
    });
    iconContainer.appendChild(iconElement);
  } else {
    // Fallback to HTML string for custom icons or emojis
    iconContainer.innerHTML = config.icon;
  }

  button.appendChild(iconContainer);
  button.title = config.tooltip;

  // Add accessibility attributes
  button.setAttribute('aria-label', config.tooltip);
  button.setAttribute('type', 'button');

  // Enhanced event handling with visual feedback
  button.addEventListener('click', () => {
    // Add subtle click animation
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
      button.style.transform = '';
    }, 100);

    config.action();
  });

  // Add keyboard navigation support
  button.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      button.click();
    }
  });

  parent.appendChild(button);
  return button;
}

export function setButtonActive(button: HTMLButtonElement, isActive: boolean): void {
  if (isActive) {
    button.classList.add('active');
    button.setAttribute('aria-pressed', 'true');
  } else {
    button.classList.remove('active');
    button.setAttribute('aria-pressed', 'false');
  }
}

/**
 * Create a button with enhanced visual feedback and loading state support
 */
export function createEnhancedButton(
  parent: HTMLElement,
  config: ToolbarButton & {
    variant?: 'primary' | 'secondary' | 'danger';
    loading?: boolean;
  },
  marginClass?: string,
): HTMLButtonElement {
  const button = createButton(parent, config, marginClass);

  // Add variant-specific styling
  if (config.variant === 'primary') {
    button.classList.add('btn-primary');
  } else if (config.variant === 'danger') {
    button.classList.add('btn-danger');
  }

  // Handle loading state
  if (config.loading) {
    setButtonLoading(button, true);
  }

  return button;
}

export function setButtonLoading(button: HTMLButtonElement, isLoading: boolean): void {
  if (isLoading) {
    button.classList.add('loading');
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
  } else {
    button.classList.remove('loading');
    button.disabled = false;
    button.setAttribute('aria-busy', 'false');
  }
}

export function setButtonVariant(
  button: HTMLButtonElement,
  variant: 'primary' | 'secondary' | 'danger',
): void {
  // Remove existing variant classes
  button.classList.remove('btn-primary', 'btn-secondary', 'btn-danger');

  // Add new variant class
  button.classList.add(`btn-${variant}`);
}
