import { IShape } from '../core/types.js';
import { createShape } from '../shapes/ShapeFactory.js';
import { BackgroundImageData } from '../background/BackgroundImage.js';
import { SchemaValidator } from './SchemaValidator.js';

export interface DesignMetadata {
  name?: string;
  author?: string;
  created?: string;
  modified?: string;
  description?: string;
}

export interface DesignData {
  shapes: IShape[];
  backgroundImages: BackgroundImageData[];
  version: string;
  metadata?: DesignMetadata;
}

declare global {
  interface Window {
    _dev_fileHandle?: FileSystemFileHandle | null;
  }
}

export class PersistenceManager {
  /**
   * Type declaration only; do not emit field initializer.
   */
  declare fileHandle: FileSystemFileHandle | null;

  constructor() {
    // Use dev file handle if present, otherwise null
    this.fileHandle =
      typeof window !== 'undefined' && (window as any)._dev_fileHandle !== undefined
        ? (window as any)._dev_fileHandle
        : null;
  }

  private _setHandle(handle: FileSystemFileHandle | null) {
    this.fileHandle = handle;
    (window as any)._dev_fileHandle = handle;
  }

  public save(designData: DesignData, saveAs = false): Promise<void> {
    // console.log('[PersistenceManager] save called. saveAs =', saveAs, 'fileHandle =', this.fileHandle);
    const pickerOpts = {
      id: 'cnc-chip-carving',
      suggestedName: 'cnc_chip_design.json',
      types: [{ description: 'JSON Files', accept: { 'application/json': ['.json'] } }],
    };
    let handle = this.fileHandle;
    const run = async (resolve: () => void, reject: (err?: any) => void) => {
      if (saveAs || !handle) {
        try {
          handle = await (window as any).showSaveFilePicker(pickerOpts);
          // console.log('[PersistenceManager] showSaveFilePicker result:', handle);
          if (!handle) {
            // console.log('Save operation was cancelled or failed.');
            resolve();
            return;
          }
          this._setHandle(handle);
        } catch (err) {
          // console.log('[PersistenceManager] showSaveFilePicker error:', err);
          if (err instanceof DOMException && err.name === 'AbortError') {
            // console.log('Save operation cancelled by user.');
            resolve();
            return;
          }
          // console.error('Failed to save file:', err);
          reject(err);
          return;
        }
      }
      if (!handle) {
        // console.log('Save operation was cancelled or failed.');
        resolve();
        return;
      }
      try {
        const writable = await handle.createWritable();
        const json = JSON.stringify(designData, null, 2);
        await writable.write(json);
        await writable.close();
        // console.log('File saved successfully.');
        resolve();
        return;
      } catch (err) {
        // console.log('[PersistenceManager] createWritable or write error:', err);
        // console.error('Failed to save file:', err);
        reject(err);
        return;
      }
    };
    return new Promise((resolve, reject) => {
      void run(resolve, reject);
    });
  }

  public load(): Promise<DesignData> {
    // console.log('[PersistenceManager] load called. fileHandle =', this.fileHandle);
    const pickerOpts = {
      id: 'cnc-chip-carving',
      types: [{ description: 'JSON Files', accept: { 'application/json': ['.json'] } }],
      multiple: false,
    };
    const run = async (resolve: (designData: DesignData) => void, reject: (err?: any) => void) => {
      let handles: FileSystemFileHandle[];
      try {
        handles = await (window as any).showOpenFilePicker(pickerOpts);
        // console.log('[PersistenceManager] showOpenFilePicker result:', handles);
      } catch (err) {
        // console.log('[PersistenceManager] showOpenFilePicker error:', err);
        if (err instanceof DOMException && err.name === 'AbortError') {
          // console.log('Load operation cancelled by user.');
          resolve({ shapes: [], backgroundImages: [], version: '2.0' });
          return;
        }
        // console.error('Failed to load file:', err);
        reject(err);
        return;
      }
      if (!handles || handles.length === 0) {
        // console.log('Load operation was cancelled or failed.');
        resolve({ shapes: [], backgroundImages: [], version: '2.0' });
        return;
      }
      const handle = handles[0];
      this._setHandle(handle);
      try {
        const file = await handle.getFile();
        const content = await file.text();
        const data = JSON.parse(content);

        // Validate filename extension
        if (!SchemaValidator.isSupportedFileExtension(file.name)) {
          throw new Error(`Unsupported file type. Please use .json files.`);
        }

        // Handle both old format (just shapes array) and new format (DesignData object)
        let designData: DesignData;
        if (Array.isArray(data)) {
          // Old format - just shapes
          designData = {
            shapes: data.map((d: any) => createShape(d)),
            backgroundImages: [],
            version: '2.0',
          };
        } else {
          // Validate the design data against schema
          if (!SchemaValidator.validateDesignData(data)) {
            throw new Error(
              `Invalid design file format. The file may be corrupted or from an incompatible version.`,
            );
          }

          // New format - DesignData object
          designData = {
            shapes: (data.shapes || []).map((d: any) => createShape(d)),
            backgroundImages: data.backgroundImages || [],
            version: data.version || '2.0',
            metadata: data.metadata,
          };
        }

        // console.log('File loaded successfully.');
        resolve(designData);
        return;
      } catch (err) {
        // console.log('[PersistenceManager] file read or parse error:', err);
        // console.error('Failed to load file:', err);
        reject(err);
        return;
      }
    };
    return new Promise((resolve, reject) => {
      void run(resolve, reject);
    });
  }
}
