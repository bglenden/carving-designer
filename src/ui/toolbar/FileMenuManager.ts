import { CallbackManager } from './CallbackManager.js';
import { SubmenuButton, type SubmenuButtonConfig } from '../components/SubmenuButton.js';

export class FileMenuManager {
  private fileMenu: HTMLElement | null = null;
  private fileBtn: HTMLButtonElement | null = null;
  private updateFileMenuUI?: (isOpen: boolean) => void;

  constructor(private primaryToolbar: HTMLElement, private callbackManager: CallbackManager) {}

  public createFileMenu(): void {
    // Define file menu actions with proper icons
    const fileActions: SubmenuButtonConfig[] = [
      {
        id: 'load-btn',
        iconName: 'load',
        label: 'Load',
        tooltip: 'Load design from file',
        action: () => {
          const callback = this.callbackManager.loadDesignCallback;
          if (callback) {
            try {
              callback();
            } catch (error) {
              console.error('Error calling Load callback:', error);
            }
          } else {
            console.warn('No callback set for Load');
          }
          this.closeFileMenu();
        },
      },
      {
        id: 'save-btn',
        iconName: 'save',
        label: 'Save',
        tooltip: 'Save current design',
        action: () => {
          const callback = this.callbackManager.saveDesignCallback;
          if (callback) {
            try {
              callback();
            } catch (error) {
              console.error('Error calling Save callback:', error);
            }
          } else {
            console.warn('No callback set for Save');
          }
          this.closeFileMenu();
        },
      },
      {
        id: 'save-as-btn',
        iconName: 'saveAs',
        label: 'Save As',
        tooltip: 'Save design with new name',
        action: () => {
          const callback = this.callbackManager.saveAsDesignCallback;
          if (callback) {
            try {
              callback();
            } catch (error) {
              console.error('Error calling Save As callback:', error);
            }
          } else {
            console.warn('No callback set for Save As');
          }
          this.closeFileMenu();
        },
      },
    ];

    // Create standardized submenu with compact dark layout (tooltips on hover)
    this.fileMenu = SubmenuButton.createSubmenu(this.primaryToolbar, fileActions, {
      orientation: 'vertical',
      showLabels: false,
      showIcons: true,
      gap: 'sm',
      theme: 'dark',
    });

    this.fileMenu.id = 'file-menu';
    this.fileMenu.style.display = 'none';

    // Position the menu to the right of the file button
    this.fileMenu.classList.add('left-full', 'top-0', 'ml-2');
  }

  public toggleFileMenu(): void {
    if (!this.fileMenu) return;

    const isCurrentlyHidden = this.fileMenu.style.display === 'none';

    if (isCurrentlyHidden) {
      this.fileMenu.style.display = 'block';
      this.updateFileMenuUI?.(true);
      document.dispatchEvent(
        new CustomEvent('toolbarStateChanged', {
          detail: { fileMenuOpen: true },
        }),
      );
    } else {
      this.closeFileMenu();
    }
  }

  public closeFileMenu(): void {
    if (this.fileMenu) {
      this.fileMenu.style.display = 'none';
      this.updateFileMenuUI?.(false);
    }
  }

  public globalClickHandler(event: Event): void {
    const target = event.target as HTMLElement;
    if (!this.fileBtn || !this.fileMenu) return;

    // Close file menu if clicked outside
    if (
      !this.fileBtn.contains(target) &&
      !this.fileMenu.contains(target) &&
      this.fileMenu.style.display !== 'none'
    ) {
      this.closeFileMenu();
    }
  }

  public setFileButton(fileBtn: HTMLButtonElement): void {
    this.fileBtn = fileBtn;
  }

  public getFileMenu(): HTMLElement | null {
    return this.fileMenu;
  }

  public setUpdateFileMenuUI(callback: (isOpen: boolean) => void): void {
    this.updateFileMenuUI = callback;
  }
}
