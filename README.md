# Carving Designer

Web-based design application for creating CNC carving patterns.

## Overview

Carving Designer is an interactive browser-based application for creating decorative carving patterns that can be manufactured using CNC machinery. It provides tools for drawing, editing, and exporting designs in a format compatible with CAD/CAM software.

## Features

- **Interactive Canvas**: Draw and manipulate leaf and tri-arc shapes
- **Real-time Editing**: Direct manipulation with handles and control points
- **Advanced Tools**:
  - Mirroring for symmetric designs
  - Jiggling for organic variation
  - Group transformations
- **File Management**:
  - JSON import/export
  - Autosave functionality
  - Background image calibration for tracing

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

This starts the Vite development server with hot module replacement.

## Building

```bash
npm run build
```

Creates a production build in the `dist/` directory.

## Testing

```bash
npm test              # Run tests once
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

## Project Structure

```
src/
├── core/          # Core functionality and algorithms
├── components/    # UI components
├── tools/         # Drawing and editing tools
├── utils/         # Utility functions
├── styles/        # CSS and styling
└── app.ts         # Main application entry point
```

## Related Projects

- [carving-schema](https://github.com/bglenden/carving-schema) - Shared schema and type definitions
- [carving-fusion](https://github.com/bglenden/carving-fusion) - Fusion 360 plugin for toolpath generation

## Technologies

- TypeScript
- Vite
- Vitest for testing
- Tailwind CSS for styling
- Canvas API for rendering

## License

MIT