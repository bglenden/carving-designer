/**
 * IconRegistry - Centralized management for SVG icons
 * Provides type-safe icon access and rendering utilities
 */

export type IconName =
  | 'file'
  | 'save'
  | 'saveAs'
  | 'load'
  | 'addShape'
  | 'edit'
  | 'background'
  | 'help'
  | 'delete'
  | 'transform'
  | 'random'
  | 'leaf'
  | 'triangle'
  | 'move'
  | 'rotate'
  | 'mirror'
  | 'duplicate'
  | 'settings'
  | 'theme'
  | 'calibrate'
  | 'ruler';

export interface IconOptions {
  size?: number;
  className?: string;
  color?: string;
  strokeWidth?: number;
}

export class IconRegistry {
  private static icons: Record<IconName, string> = {
    file: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V16C4 16.5304 4.21071 17.0391 4.58579 17.4142C4.96086 17.7893 5.46957 18 6 18H14C14.5304 18 15.0391 17.7893 15.4142 17.4142C15.7893 17.0391 16 16.5304 16 16V6L12 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M12 2V6H16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

    addShape: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 4V16M4 10H16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.5"/>
    </svg>`,

    edit: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14.5 2.5C14.8978 2.10218 15.4374 1.87868 16 1.87868C16.5626 1.87868 17.1022 2.10218 17.5 2.5C17.8978 2.89782 18.1213 3.43739 18.1213 4C18.1213 4.56261 17.8978 5.10218 17.5 5.5L6 17L2 18L3 14L14.5 2.5Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

    background: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" stroke-width="1.5"/>
      <path d="M9 9L15 3M3 15L7 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="7.5" cy="7.5" r="1.5" stroke="currentColor" stroke-width="1.5"/>
    </svg>`,

    help: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.5"/>
      <path d="M7.5 7.5C7.5 6.11929 8.61929 5 10 5C11.3807 5 12.5 6.11929 12.5 7.5C12.5 8.88071 11.3807 10 10 10V11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="10" cy="14" r="0.5" fill="currentColor"/>
    </svg>`,

    delete: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 5L4 5M8 5V3C8 2.44772 8.44772 2 9 2H11C11.5523 2 12 2.44772 12 3V5M14 5V16C14 16.5523 13.5523 17 13 17H7C6.44772 17 6 16.5523 6 16V5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M8 8V14M12 8V14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,

    transform: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 2L15 7L10 12M2 10H15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M5 15L7 13L9 15L7 17L5 15Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

    random: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="4" height="4" rx="1" stroke="currentColor" stroke-width="1.5"/>
      <rect x="13" y="3" width="4" height="4" rx="1" stroke="currentColor" stroke-width="1.5"/>
      <rect x="3" y="13" width="4" height="4" rx="1" stroke="currentColor" stroke-width="1.5"/>
      <rect x="13" y="13" width="4" height="4" rx="1" stroke="currentColor" stroke-width="1.5"/>
      <circle cx="10" cy="10" r="2" stroke="currentColor" stroke-width="1.5"/>
    </svg>`,

    leaf: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 2C6 2 2 6 2 10C2 14 6 18 10 18C14 14 18 10 18 6C18 4 14 2 10 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M10 2L10 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M6 7C8 9 12 9 14 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,

    triangle: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 2L18 16H2L10 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

    move: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 2V18M18 10H2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M7 5L10 2L13 5M7 15L10 18L13 15M5 7L2 10L5 13M15 7L18 10L15 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

    rotate: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10C18 14.4183 14.4183 18 10 18C7.87827 18 5.84344 17.1571 4.34315 15.6569" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M2 14L4.34315 15.6569L6 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

    mirror: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 2V18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M6 6L2 10L6 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M14 6L18 10L14 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

    duplicate: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="9" y="9" width="9" height="9" rx="2" stroke="currentColor" stroke-width="1.5"/>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" stroke-width="1.5"/>
    </svg>`,

    settings: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 12C11.1046 12 12 11.1046 12 10C12 8.89543 11.1046 8 10 8C8.89543 8 8 8.89543 8 10C8 11.1046 8.89543 12 10 12Z" stroke="currentColor" stroke-width="1.5"/>
      <path d="M16.24 7.76C16.09 7.44 15.73 7.24 15.37 7.24H14.94C14.7944 6.93394 14.6062 6.64487 14.38 6.38L14.65 6.11C14.85 5.91 14.85 5.59 14.65 5.39L12.61 3.35C12.41 3.15 12.09 3.15 11.89 3.35L11.62 3.62C11.3551 3.39378 11.0661 3.20556 10.76 3.06H10.24C9.88 3.06 9.56 3.26 9.41 3.58L8.35 5.84C8.25 6.06 8.3 6.32 8.46 6.48L9.17 7.19C9.06 7.43 8.97 7.68 8.9 7.94L7.76 8.24C7.44 8.34 7.24 8.66 7.24 9.02V11.98C7.24 12.34 7.44 12.66 7.76 12.76L8.9 13.06C8.97 13.32 9.06 13.57 9.17 13.81L8.46 14.52C8.3 14.68 8.25 14.94 8.35 15.16L9.41 17.42C9.56 17.74 9.88 17.94 10.24 17.94H10.76C11.0661 17.7944 11.3551 17.6062 11.62 17.38L11.89 17.65C12.09 17.85 12.41 17.85 12.61 17.65L14.65 15.61C14.85 15.41 14.85 15.09 14.65 14.89L14.38 14.62C14.6062 14.3551 14.7944 14.0661 14.94 13.76H15.37C15.73 13.76 16.09 13.56 16.24 13.24L17.3 10.98C17.4 10.76 17.35 10.5 17.19 10.34L16.48 9.63C16.59 9.39 16.68 9.14 16.75 8.88L17.89 8.58C18.21 8.48 18.41 8.16 18.41 7.8V4.84C18.41 4.48 18.21 4.16 17.89 4.06L16.75 3.76C16.68 3.5 16.59 3.25 16.48 3.01L17.19 2.3C17.35 2.14 17.4 1.88 17.3 1.66L16.24 -0.6C16.09 -0.92 15.73 -1.12 15.37 -1.12H14.94C14.6339 -0.86444 14.2551 -0.67622 13.96 -0.54L13.69 -0.81C13.49 -1.01 13.17 -1.01 12.97 -0.81L10.93 1.23C10.73 1.43 10.73 1.75 10.93 1.95L11.2 2.22C10.9349 2.44622 10.6459 2.63444 10.34 2.78H9.82C9.46 2.78 9.14 2.98 8.99 3.3L7.93 5.56C7.83 5.78 7.88 6.04 8.04 6.2L8.75 6.91C8.64 7.15 8.55 7.4 8.48 7.66L7.34 7.96C7.02 8.06 6.82 8.38 6.82 8.74V11.7C6.82 12.06 7.02 12.38 7.34 12.48L8.48 12.78C8.55 13.04 8.64 13.29 8.75 13.53L8.04 14.24C7.88 14.4 7.83 14.66 7.93 14.88L8.99 17.14C9.14 17.46 9.46 17.66 9.82 17.66H10.34C10.6459 17.5156 10.9349 17.3274 11.2 17.1L11.47 17.37C11.67 17.57 11.99 17.57 12.19 17.37L14.23 15.33C14.43 15.13 14.43 14.81 14.23 14.61L13.96 14.34C14.2551 14.1926 14.6339 14.0044 14.94 13.75H15.37C15.73 13.75 16.09 13.55 16.24 13.23L17.3 10.97C17.4 10.75 17.35 10.49 17.19 10.33L16.48 9.62C16.59 9.38 16.68 9.13 16.75 8.87L17.89 8.57C18.21 8.47 18.41 8.15 18.41 7.79V4.83C18.41 4.47 18.21 4.15 17.89 4.05L16.75 3.75C16.68 3.49 16.59 3.24 16.48 3L17.19 2.29C17.35 2.13 17.4 1.87 17.3 1.65L16.24 -0.61Z" stroke="currentColor" stroke-width="1.5"/>
    </svg>`,

    theme: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 2C10 2 12 4 12 7C12 8.65685 10.6569 10 9 10C7.34315 10 6 8.65685 6 7C6 4 8 2 8 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M10 10V18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.5"/>
    </svg>`,

    save: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 7H16C16.5523 7 17 7.44772 17 8V16C17 16.5523 16.5523 17 16 17H4C3.44772 17 3 16.5523 3 16V8C3 7.44772 3.44772 7 4 7H5" stroke="currentColor" stroke-width="1.5"/>
      <rect x="6" y="3" width="8" height="8" rx="1" stroke="currentColor" stroke-width="1.5"/>
      <path d="M8 5H12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,

    saveAs: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 7H16C16.5523 7 17 7.44772 17 8V16C17 16.5523 16.5523 17 16 17H4C3.44772 17 3 16.5523 3 16V8C3 7.44772 3.44772 7 4 7H5" stroke="currentColor" stroke-width="1.5"/>
      <rect x="6" y="3" width="8" height="8" rx="1" stroke="currentColor" stroke-width="1.5"/>
      <path d="M8 5H12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M13 12L15 14L19 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

    load: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 17V9C4 8.44772 4.44772 8 5 8H7L9 6H15C15.5523 6 16 6.44772 16 7V17C16 17.5523 15.5523 18 15 18H5C4.44772 18 4 17.5523 4 17Z" stroke="currentColor" stroke-width="1.5"/>
      <path d="M10 11V15M8 13L10 15L12 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

    calibrate: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 4L16 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M4 4V2M4 4H2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M16 16V18M16 16H18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M6 4V6M8 4V6M10 4V6M12 4V6M14 4V6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M16 6H14M16 8H14M16 10H14M16 12H14M16 14H14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,

    ruler: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="8" width="16" height="4" rx="1" stroke="currentColor" stroke-width="1.5"/>
      <path d="M4 8V10M6 8V11M8 8V10M10 8V11M12 8V10M14 8V11M16 8V10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,
  };

  /**
   * Get the SVG string for an icon
   */
  static getIcon(name: IconName): string {
    return this.icons[name] || this.icons.help;
  }

  /**
   * Create an SVG element with the specified icon
   */
  static createElement(name: IconName, options: IconOptions = {}): SVGElement {
    const { size = 20, className = '', color, strokeWidth } = options;

    const svgString = this.getIcon(name);
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    const svgElement = doc.documentElement as unknown as SVGElement;

    // Set size
    svgElement.setAttribute('width', size.toString());
    svgElement.setAttribute('height', size.toString());

    // Set class name
    if (className) {
      svgElement.setAttribute('class', className);
    }

    // Set color (overrides currentColor)
    if (color) {
      svgElement.setAttribute('stroke', color);
    }

    // Set stroke width
    if (strokeWidth) {
      const paths = svgElement.querySelectorAll('path, circle, rect');
      paths.forEach((path) => {
        if (path.hasAttribute('stroke')) {
          path.setAttribute('stroke-width', strokeWidth.toString());
        }
      });
    }

    return svgElement;
  }

  /**
   * Create an HTML element containing the icon
   */
  static createContainer(name: IconName, options: IconOptions = {}): HTMLElement {
    const { className = '', ...iconOptions } = options;
    const container = document.createElement('div');
    container.className = `icon-container ${className}`;
    container.appendChild(this.createElement(name, iconOptions));
    return container;
  }

  /**
   * Get all available icon names
   */
  static getAvailableIcons(): IconName[] {
    return Object.keys(this.icons) as IconName[];
  }

  /**
   * Check if an icon exists
   */
  static hasIcon(name: string): name is IconName {
    return name in this.icons;
  }
}
