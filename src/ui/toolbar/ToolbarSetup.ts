import { ShapeType } from '../../core/types.js';
import { setupPrimaryToolbar } from '../PrimaryToolbar.js';
import { createButton, setButtonActive } from './ButtonFactory.js';
import { CallbackManager } from './CallbackManager.js';
import { FileMenuManager } from './FileMenuManager.js';
import { EventHandlers } from './EventHandlers.js';
import { HelpDialog } from './HelpDialog.js';
import { BackgroundToolbarSetup } from './BackgroundToolbarSetup.js';
import { SubmenuButton, type SubmenuButtonConfig } from '../components/SubmenuButton.js';

export interface ToolbarElements {
  primaryToolbar: HTMLElement;
  secondaryToolbar: HTMLElement | null;
  editToolbar: HTMLElement | null;
  backgroundToolbar: HTMLElement | null;
  addShapeBtn: HTMLButtonElement | null;
  editBtn: HTMLButtonElement | null;
  backgroundBtn: HTMLButtonElement | null;
  fileBtn: HTMLButtonElement | null;
  helpBtn: HTMLButtonElement | null;
  leafBtn: HTMLButtonElement | null;
  triArcBtn: HTMLButtonElement | null;
  moveBtn: HTMLButtonElement | null;
  rotateBtn: HTMLButtonElement | null;
  mirrorBtn: HTMLButtonElement | null;
  jiggleBtn: HTMLButtonElement | null;
  duplicateBtn: HTMLButtonElement | null;
  loadImageBtn: HTMLButtonElement | null;
  calibrateBtn: HTMLButtonElement | null;
  opacitySlider: HTMLInputElement | null;
}

export class ToolbarSetup {
  public static setupAllToolbars(
    primaryToolbar: HTMLElement,
    callbackManager: CallbackManager,
    fileMenuManager: FileMenuManager,
    eventHandlers: EventHandlers,
  ): ToolbarElements {
    const elements: ToolbarElements = {
      primaryToolbar,
      secondaryToolbar: null,
      editToolbar: null,
      backgroundToolbar: null,
      addShapeBtn: null,
      editBtn: null,
      backgroundBtn: null,
      fileBtn: null,
      helpBtn: null,
      leafBtn: null,
      triArcBtn: null,
      moveBtn: null,
      rotateBtn: null,
      mirrorBtn: null,
      jiggleBtn: null,
      duplicateBtn: null,
      loadImageBtn: null,
      calibrateBtn: null,
      opacitySlider: null,
    };

    this.setupPrimaryToolbar(primaryToolbar, callbackManager, fileMenuManager, elements);
    this.setupSecondaryToolbar(primaryToolbar, callbackManager, eventHandlers, elements);
    this.setupEditToolbar(primaryToolbar, callbackManager, elements);
    BackgroundToolbarSetup.setup(primaryToolbar, callbackManager, elements);

    return elements;
  }

  private static setupPrimaryToolbar(
    primaryToolbar: HTMLElement,
    callbackManager: CallbackManager,
    fileMenuManager: FileMenuManager,
    elements: ToolbarElements,
  ): void {
    setupPrimaryToolbar(
      primaryToolbar,
      [
        {
          id: 'file-btn',
          icon: 'F',
          iconName: 'file',
          tooltip: 'File',
          action: () => fileMenuManager.toggleFileMenu(),
        },
        {
          id: 'add-shape-btn',
          icon: '+',
          iconName: 'addShape',
          tooltip: 'Add Shape',
          action: () => {
            if (callbackManager.togglePlacementCallback) {
              callbackManager.togglePlacementCallback();
            } else {
              // No callback set - silently ignore
            }
          },
        },
        {
          id: 'edit-btn',
          icon: '✏️',
          iconName: 'edit',
          tooltip: 'Edit Shapes (E)',
          action: () => {
            callbackManager.toggleEditModeCallback?.();
          },
        },
        {
          id: 'background-btn',
          icon: '🖼️',
          iconName: 'background',
          tooltip: 'Background Images (B)',
          action: () => {
            callbackManager.toggleBackgroundModeCallback?.();
          },
        },
        {
          id: 'help-btn',
          icon: '?',
          iconName: 'help',
          tooltip: 'Help & Controls',
          action: () => {
            HelpDialog.show();
          },
        },
      ],
      createButton,
    );

    // Assign key button references after primary toolbar setup
    const fileBtn = primaryToolbar.querySelector('#file-btn') as HTMLButtonElement;
    fileMenuManager.setFileButton(fileBtn);
    elements.fileBtn = fileBtn;
    elements.addShapeBtn = primaryToolbar.querySelector('#add-shape-btn');
    elements.editBtn = primaryToolbar.querySelector('#edit-btn');
    elements.backgroundBtn = primaryToolbar.querySelector('#background-btn');
    elements.helpBtn = primaryToolbar.querySelector('#help-btn');
  }

  private static setupSecondaryToolbar(
    primaryToolbar: HTMLElement,
    callbackManager: CallbackManager,
    eventHandlers: EventHandlers,
    elements: ToolbarElements,
  ): void {
    // Define shape creation actions with proper labels
    const shapeActions: SubmenuButtonConfig[] = [
      {
        id: 'create-leaf-btn',
        iconName: 'leaf',
        label: 'Leaf',
        tooltip: 'Create Leaf shape',
        action: () => {
          if (eventHandlers.getActivePlacementShape() === ShapeType.LEAF) {
            document.dispatchEvent(new CustomEvent('cancelShapePlacement'));
          } else {
            callbackManager.createShapeCallback?.(ShapeType.LEAF);
          }
        },
      },
      {
        id: 'create-triarc-btn',
        iconName: 'triangle',
        label: 'Tri-Arc',
        tooltip: 'Create Tri-Arc shape',
        action: () => {
          if (eventHandlers.getActivePlacementShape() === ShapeType.TRI_ARC) {
            document.dispatchEvent(new CustomEvent('cancelShapePlacement'));
          } else {
            callbackManager.createShapeCallback?.(ShapeType.TRI_ARC);
          }
        },
      },
    ];

    // Create standardized submenu with compact dark layout (tooltips on hover)
    elements.secondaryToolbar = SubmenuButton.createSubmenu(primaryToolbar, shapeActions, {
      orientation: 'vertical',
      showLabels: false,
      showIcons: true,
      gap: 'sm',
      theme: 'dark',
    });

    elements.secondaryToolbar.id = 'secondary-toolbar';
    elements.secondaryToolbar.style.display = 'none';

    // Position the menu to the right of the add shape button
    elements.secondaryToolbar.classList.add('left-full', 'top-0', 'ml-2');

    // Assign secondary shape button references after secondary toolbar setup
    elements.leafBtn = elements.secondaryToolbar.querySelector('#create-leaf-btn');
    elements.triArcBtn = elements.secondaryToolbar.querySelector('#create-triarc-btn');
  }

  private static setupEditToolbar(
    primaryToolbar: HTMLElement,
    callbackManager: CallbackManager,
    elements: ToolbarElements,
  ): void {
    // Define edit actions with proper labels
    const editActions: SubmenuButtonConfig[] = [
      {
        id: 'delete-all-btn',
        iconName: 'delete',
        label: 'Delete All',
        tooltip: 'Delete all shapes',
        variant: 'danger',
        action: () => callbackManager.deleteAllCallback?.(),
      },
      {
        id: 'move-btn',
        iconName: 'move',
        label: 'Move',
        tooltip: 'Move selected shapes',
        action: () => callbackManager.moveCallback?.(),
      },
      {
        id: 'rotate-btn',
        iconName: 'rotate',
        label: 'Rotate',
        tooltip: 'Rotate selected shapes',
        action: () => callbackManager.rotateCallback?.(),
      },
      {
        id: 'mirror-btn',
        iconName: 'mirror',
        label: 'Mirror',
        tooltip: 'Mirror selected shapes',
        action: () => callbackManager.mirrorCallback?.(),
      },
      {
        id: 'jiggle-btn',
        iconName: 'random',
        label: 'Jiggle',
        tooltip: 'Add random variation to selected shapes',
        action: () => callbackManager.jiggleCallback?.(),
      },
      {
        id: 'duplicate-btn',
        iconName: 'duplicate',
        label: 'Duplicate',
        tooltip: 'Duplicate selected shapes',
        action: () => {
          callbackManager.duplicateCallback?.();
          if (elements.duplicateBtn) {
            // Make the button momentary
            setButtonActive(elements.duplicateBtn, true);
            setTimeout(() => {
              if (elements.duplicateBtn) {
                setButtonActive(elements.duplicateBtn, false);
              }
            }, 100);
          }
        },
      },
    ];

    // Create standardized submenu with compact dark layout (tooltips on hover)
    elements.editToolbar = SubmenuButton.createSubmenu(primaryToolbar, editActions, {
      orientation: 'vertical',
      showLabels: false,
      showIcons: true,
      gap: 'sm',
      theme: 'dark',
    });

    elements.editToolbar.id = 'edit-toolbar';
    elements.editToolbar.style.display = 'none';

    // Position the menu to the right of the edit button
    elements.editToolbar.classList.add('left-full', 'top-0', 'ml-2');

    elements.moveBtn = elements.editToolbar.querySelector('#move-btn') as HTMLButtonElement;
    elements.rotateBtn = elements.editToolbar.querySelector('#rotate-btn') as HTMLButtonElement;
    elements.mirrorBtn = elements.editToolbar.querySelector('#mirror-btn') as HTMLButtonElement;
    elements.jiggleBtn = elements.editToolbar.querySelector('#jiggle-btn') as HTMLButtonElement;
    elements.duplicateBtn = elements.editToolbar.querySelector(
      '#duplicate-btn',
    ) as HTMLButtonElement;
  }
}
