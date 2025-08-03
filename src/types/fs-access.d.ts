// This file contains type definitions for the File System Access API,
// which are not yet part of the standard TypeScript library.

interface FileSystemFileHandle {
  createWritable(): Promise<FileSystemWritableFileStream>;
  getFile(): Promise<File>;
  readonly kind: 'file';
  readonly name: string;
}

interface FileSystemWritableFileStream extends WritableStream {
  write(data: any): Promise<void>;
  seek(position: number): Promise<void>;
  truncate(size: number): Promise<void>;
  close(): Promise<void>;
}

interface FilePickerOptions {
  types?: {
    description: string;
    accept: Record<string, string[]>;
  }[];
  multiple?: boolean;
  excludeAcceptAllOption?: boolean;
}

type SaveFilePickerOptions = FilePickerOptions;
type OpenFilePickerOptions = FilePickerOptions;

interface Window {
  showOpenFilePicker(options?: OpenFilePickerOptions): Promise<FileSystemFileHandle[]>;
  showSaveFilePicker(options?: SaveFilePickerOptions): Promise<FileSystemFileHandle>;
}
