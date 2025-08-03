# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Run tests
npm test                # Run all tests once
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Generate coverage report

# Code quality
npm run lint            # Check for linting errors
npm run lint:fix        # Auto-fix linting errors
npm run format          # Format code with Prettier

# Clean build artifacts
npm run clean
```

## Dependencies Setup

### Schema Package

The project depends on `@carving/schema` which is located in `../carving-schema`. To set it up:

```bash
# First time setup - link the schema package
cd ../carving-schema
npm link
cd ../carving-designer
npm link @carving/schema

# If you need to rebuild the schema types
cd ../carving-schema
npm run build
```

## Architecture Overview

This is a web-based design application for creating CNC carving patterns, built with TypeScript and Canvas API.

### Core Architecture Pattern

The application follows a Manager/Handler pattern with clear separation of concerns:

1. **Core Managers** (src/core/): Stateful components that maintain application state

   - `SelectionManager`: Tracks selected shapes
   - `PlacementManager`: Handles shape placement modes
   - `TransformationManager`: Manages shape transformations (move, rotate, scale)
   - All managers extend `BaseManager` or `StatefulManager` for consistent state management

2. **Canvas System** (src/canvas/): Canvas rendering and interaction

   - `CanvasManager`: Main canvas controller, coordinates all rendering
   - Mouse and touch handlers for pan/zoom functionality
   - Event delegation to appropriate handlers based on current mode

3. **Shape System** (src/shapes/): Shape definitions and operations

   - `BaseShape`: Abstract base class for all shapes
   - `Leaf` and `TriArc`: Concrete shape implementations
   - `ShapeFactory`: Creates shapes from type strings
   - Each shape handles its own rendering, hit-testing, and transformations

4. **Application Layer** (src/app/): Orchestration and user interaction

   - `App`: Main application class that initializes and coordinates all managers
   - `AppDependencyManager`: Handles dependency injection
   - `AppModeManager`: Manages application modes (edit, placement, background)
   - Mouse/keyboard handlers that delegate to appropriate managers based on mode

5. **Background Image System** (src/background/): Calibration and tracing support

   - `BackgroundImageManager`: Manages background images for tracing
   - `BackgroundImageHandler`: Handles calibration and transformation
   - Supports opacity adjustment and geometric calibration

6. **UI Components** (src/ui/): Toolbar and modal management
   - `ToolbarManager`: Main toolbar controller
   - Modal dialogs for jiggle and mirror operations
   - Status bar for displaying coordinates and mode

### Key Design Patterns

- **Dependency Injection**: Managers are injected through constructors for testability
- **Event-Driven**: Custom event system for inter-component communication
- **Strategy Pattern**: Mouse handlers switch based on application mode
- **Factory Pattern**: Shape creation through ShapeFactory
- **Command Pattern**: File operations and transformations are encapsulated

### Testing Strategy

- Unit tests for all core managers and shapes
- Integration tests for complex interactions
- Mock implementations in `__mocks__` directories
- Test utilities in `tests/mocks/` for common test setups

### File Format

The application uses JSON for persistence with a defined schema in `schema/design-schema.json`. Files include:

- Shape definitions with positions and properties
- Background image data with calibration
- Application state and settings
