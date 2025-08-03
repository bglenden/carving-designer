import { ShapeType } from '../../core/types.js';
import { TransformMode } from '../../core/TransformationManager.js';
import { SubmenuButton } from '../components/SubmenuButton.js';

export class UIUpdater {
  constructor(
    private elements: {
      secondaryToolbar: HTMLElement | null;
      editToolbar: HTMLElement | null;
      backgroundToolbar: HTMLElement | null;
      addShapeBtn: HTMLButtonElement | null;
      editBtn: HTMLButtonElement | null;
      backgroundBtn: HTMLButtonElement | null;
      fileBtn: HTMLButtonElement | null;
      leafBtn: HTMLButtonElement | null;
      triArcBtn: HTMLButtonElement | null;
      moveBtn: HTMLButtonElement | null;
      rotateBtn: HTMLButtonElement | null;
      mirrorBtn: HTMLButtonElement | null;
      jiggleBtn: HTMLButtonElement | null;
      calibrateBtn: HTMLButtonElement | null;
    },
    private setButtonActive: (button: HTMLButtonElement, isActive: boolean) => void,
    private closeFileMenu: () => void,
  ) {}

  public updatePlacementUI(isActive: boolean, shapeType: ShapeType | null): void {
    if (this.elements.secondaryToolbar) {
      this.elements.secondaryToolbar.style.display = isActive ? 'flex' : 'none';
    }

    if (this.elements.addShapeBtn) {
      this.setButtonActive(this.elements.addShapeBtn, isActive);
    }

    // Deactivate other primary buttons when activating placement mode
    if (isActive) {
      if (this.elements.editBtn) {
        this.setButtonActive(this.elements.editBtn, false);
      }
      if (this.elements.backgroundBtn) {
        this.setButtonActive(this.elements.backgroundBtn, false);
      }
      if (this.elements.fileBtn) {
        this.setButtonActive(this.elements.fileBtn, false);
      }

      // Hide other toolbars
      this.closeFileMenu();
      if (this.elements.editToolbar) {
        this.elements.editToolbar.style.display = 'none';
      }
      if (this.elements.backgroundToolbar) {
        this.elements.backgroundToolbar.style.display = 'none';
      }
    }

    this.updateShapeButtonStyles(shapeType);
  }

  public updateEditUI(isActive: boolean): void {
    if (this.elements.editToolbar) {
      this.elements.editToolbar.style.display = isActive ? 'flex' : 'none';
    }

    if (this.elements.editBtn) {
      this.setButtonActive(this.elements.editBtn, isActive);
    }

    // Deactivate other primary buttons when activating edit mode
    if (isActive) {
      if (this.elements.addShapeBtn) {
        this.setButtonActive(this.elements.addShapeBtn, false);
      }
      if (this.elements.backgroundBtn) {
        this.setButtonActive(this.elements.backgroundBtn, false);
      }
      if (this.elements.fileBtn) {
        this.setButtonActive(this.elements.fileBtn, false);
      }

      // Hide other toolbars
      this.closeFileMenu();
      if (this.elements.secondaryToolbar) {
        this.elements.secondaryToolbar.style.display = 'none';
      }
      if (this.elements.backgroundToolbar) {
        this.elements.backgroundToolbar.style.display = 'none';
      }
    }
  }

  public updateTransformUI(mode: TransformMode): void {
    const transformButtons = [
      { button: this.elements.moveBtn, mode: TransformMode.MOVE },
      { button: this.elements.rotateBtn, mode: TransformMode.ROTATE },
      { button: this.elements.mirrorBtn, mode: TransformMode.MIRROR },
      { button: this.elements.jiggleBtn, mode: TransformMode.JIGGLE },
    ];

    transformButtons.forEach(({ button, mode: buttonMode }) => {
      if (button) {
        this.setButtonActive(button, mode === buttonMode);
      }
    });
  }

  public updateShapeButtonStyles(shapeType: ShapeType | null): void {
    if (this.elements.leafBtn) {
      SubmenuButton.setButtonActive(this.elements.leafBtn, shapeType === ShapeType.LEAF);
    }
    if (this.elements.triArcBtn) {
      SubmenuButton.setButtonActive(this.elements.triArcBtn, shapeType === ShapeType.TRI_ARC);
    }
  }

  public updateBackgroundUI(isActive: boolean): void {
    if (this.elements.backgroundToolbar) {
      this.elements.backgroundToolbar.style.display = isActive ? 'flex' : 'none';
    }

    if (this.elements.backgroundBtn) {
      this.setButtonActive(this.elements.backgroundBtn, isActive);
    }

    // Deactivate other primary buttons when activating background mode
    if (isActive) {
      if (this.elements.addShapeBtn) {
        this.setButtonActive(this.elements.addShapeBtn, false);
      }
      if (this.elements.editBtn) {
        this.setButtonActive(this.elements.editBtn, false);
      }
      if (this.elements.fileBtn) {
        this.setButtonActive(this.elements.fileBtn, false);
      }

      // Hide other toolbars
      this.closeFileMenu();
      if (this.elements.secondaryToolbar) {
        this.elements.secondaryToolbar.style.display = 'none';
      }
      if (this.elements.editToolbar) {
        this.elements.editToolbar.style.display = 'none';
      }
    }
  }

  public updateCalibrationUI(isCalibrating: boolean): void {
    if (this.elements.calibrateBtn) {
      this.setButtonActive(this.elements.calibrateBtn, isCalibrating);
    }
  }

  public updateFileMenuUI(isOpen: boolean): void {
    if (this.elements.fileBtn) {
      this.setButtonActive(this.elements.fileBtn, isOpen);
    }

    // Deactivate other primary buttons when opening file menu
    if (isOpen) {
      if (this.elements.addShapeBtn) {
        this.setButtonActive(this.elements.addShapeBtn, false);
      }
      if (this.elements.editBtn) {
        this.setButtonActive(this.elements.editBtn, false);
      }
      if (this.elements.backgroundBtn) {
        this.setButtonActive(this.elements.backgroundBtn, false);
      }

      // Hide other toolbars (but don't close file menu!)
      if (this.elements.secondaryToolbar) {
        this.elements.secondaryToolbar.style.display = 'none';
      }
      if (this.elements.editToolbar) {
        this.elements.editToolbar.style.display = 'none';
      }
      if (this.elements.backgroundToolbar) {
        this.elements.backgroundToolbar.style.display = 'none';
      }
    }
  }
}
