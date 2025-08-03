import { App } from './app.js';
import '../styles/ui.css';

document.addEventListener('DOMContentLoaded', () => {
  const canvasElement = document.getElementById('design-canvas') as HTMLCanvasElement;
  if (!canvasElement) {
    throw new Error('Canvas element with id `design-canvas` not found');
  }

  const app = new App(canvasElement);
  app.initialize();
});
