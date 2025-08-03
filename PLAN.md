# Design Program Development Plan

> **Note:** This plan covers features specific to the web-based design application. 
> See [Master Plan](../PLAN.md) for overall project roadmap.

## Current Status

### Implemented Features ✅
- Canvas rendering with grid and coordinate system
- Two shape types: Leaf and Tri-Arc
- Shape manipulation: move, rotate, mirror, jiggle, duplicate
- Selection system (single/multi-select)
- File operations (save/load JSON)
- Auto-save to localStorage
- Background image support with calibration
- Three operation modes: placement, edit, background
- Keyboard shortcuts
- Copy/paste functionality

### Architecture Status
- TypeScript with strict type checking
- Vite build system
- Vitest with ~90% test coverage
- Files approaching 350-line limit (see REFACTORING_PLAN.md)

## Known Issues

### High Priority
- **No Undo/Redo**: Users cannot undo actions
- **No Export**: Cannot export designs to SVG/DXF/PNG
- **Limited Shapes**: Only 2 shape types available

### Medium Priority
- **No Grid Snap**: Precise alignment is difficult
- **No Measurements**: Cannot measure distances/angles
- **No Layers**: All shapes on single layer

### Low Priority
- **Coordinate Display Lag**: Updates slowly during fast mouse movement
- **No Touch Gesture Support**: Limited tablet usability

## Phase 1: Essential Features (Current Priority)

### 1.1 Undo/Redo System
**Implementation Plan**:
- [ ] Create `UndoManager` class with command pattern
- [ ] Define `Command` interface with execute/undo methods
- [ ] Implement commands for all operations:
  - [ ] AddShapeCommand
  - [ ] DeleteShapeCommand
  - [ ] MoveShapeCommand
  - [ ] RotateShapeCommand
  - [ ] MirrorShapeCommand
  - [ ] JiggleShapeCommand
- [ ] Add undo/redo stacks with configurable depth
- [ ] Keyboard shortcuts: Ctrl+Z, Ctrl+Y/Ctrl+Shift+Z
- [ ] Toolbar buttons with state indicators
- [ ] Test coverage for all commands

### 1.2 Export Functionality
**SVG Export**:
- [ ] Create `SVGExporter` class
- [ ] Convert shapes to SVG paths
- [ ] Handle coordinate system transformation
- [ ] Export dialog with options:
  - [ ] Scale/units selection
  - [ ] Include grid option
  - [ ] Background color

**DXF Export**:
- [ ] Research DXF format requirements
- [ ] Create `DXFExporter` class
- [ ] Convert shapes to DXF entities
- [ ] Layer support for different shape types

**Image Export**:
- [ ] PNG/JPEG export using canvas.toBlob()
- [ ] Resolution selection dialog
- [ ] Include/exclude grid and background

### 1.3 Additional Shape Types
**Rectangle Shape**:
- [ ] Create `Rectangle` class extending `BaseShape`
- [ ] Width/height parameters
- [ ] Corner radius option
- [ ] Hit testing and manipulation handles

**Circle Shape**:
- [ ] Create `Circle` class
- [ ] Radius parameter
- [ ] Ellipse variant with two radii

**Polygon Shape**:
- [ ] Create `Polygon` class
- [ ] Number of sides parameter (3-12)
- [ ] Regular/star polygon variants

**Custom Path**:
- [ ] Research bezier curve editing
- [ ] Path point manipulation UI
- [ ] Curve handle editing

### 1.4 Grid Snapping
- [ ] Add snap settings to toolbar
- [ ] Implement snap-to-grid logic
- [ ] Visual feedback during snapping
- [ ] Configurable grid size
- [ ] Snap to shape points/edges

## Phase 1.5: Visual Polish & Design System

### 1.5.1 Icon System & Visual Assets
**SVG Icon System**:
- [ ] Create centralized icon system with SVG icons to replace emoji icons
- [ ] Design consistent icon set for all toolbar buttons (File, Add Shape, Edit, Background, Help, Delete, Transform)
- [ ] Implement `IconRegistry` class for managing SVG icons
- [ ] Create organized assets directory structure:
  - [ ] `src/assets/icons/` for SVG icon files
  - [ ] `src/assets/styles/` for shared design resources
  - [ ] Icon naming convention and documentation

**Design Token System**:
- [ ] Extend Tailwind config with custom design tokens and color palette
- [ ] Define consistent spacing, typography, and color scales
- [ ] Create CSS custom properties for dynamic theming
- [ ] Document design system guidelines

### 1.5.2 Component Styling & Interactions
**Button & Toolbar Improvements**:
- [ ] Create reusable CSS component classes for consistent button styling
- [ ] Enhance button states (hover, active, disabled) with proper visual feedback
- [ ] Improve toolbar visual design with better shadows, spacing, and hierarchy
- [ ] Add focus indicators for keyboard navigation
- [ ] Implement consistent border radius and elevation system

**Animations & Transitions**:
- [ ] Add subtle animations and transitions for better user experience
- [ ] Smooth state transitions for buttons and UI elements
- [ ] Loading states and micro-interactions
- [ ] Optimized animations for performance

### 1.5.3 Accessibility & Responsiveness
**Accessibility Improvements**:
- [ ] WCAG 2.1 AA compliance for color contrast
- [ ] Proper ARIA labels and roles for screen readers
- [ ] Keyboard navigation support for all interactive elements
- [ ] Focus management and visible focus indicators

**Responsive Design**:
- [ ] Responsive toolbar layout for different screen sizes
- [ ] Touch-friendly button sizes and spacing
- [ ] Mobile viewport optimization
- [ ] Tablet-specific UI adaptations

## Phase 2: Professional Features

### 2.1 Layers System
- [ ] Layer manager UI panel
- [ ] Layer operations: add, delete, rename, reorder
- [ ] Visibility and lock toggles
- [ ] Layer opacity control
- [ ] Select all on layer

### 2.2 Measurement Tools
- [ ] Distance measurement tool
- [ ] Angle measurement tool
- [ ] Area calculation for closed shapes
- [ ] Persistent dimension annotations
- [ ] Unit conversion (mm/inch)

### 2.3 Advanced Operations
- [ ] Boolean operations (CSG library integration)
- [ ] Offset/inset shapes
- [ ] Array tools (linear, circular, grid)
- [ ] Align and distribute commands
- [ ] Shape morphing between compatible types

### 2.4 Advanced UI Features
**Settings & Preferences System**:
- [ ] Create settings/preferences dialog with organized tabs
- [ ] User preference persistence (localStorage/IndexedDB)
- [ ] Import/export user settings
- [ ] Customizable keyboard shortcuts editor
- [ ] UI theme selection and customization

**Theme System**:
- [ ] Dark theme option with proper contrast ratios
- [ ] High contrast mode for accessibility
- [ ] Custom color scheme editor
- [ ] Automatic theme switching based on system preference
- [ ] Theme preview functionality

**Advanced Interactions**:
- [ ] Context menus for shapes and canvas
- [ ] Right-click actions and shortcuts
- [ ] Improved touch gesture support:
  - [ ] Multi-touch pinch-to-zoom refinements
  - [ ] Touch-specific selection feedback
  - [ ] Gesture-based shape manipulation
- [ ] Drag and drop improvements
- [ ] Advanced keyboard shortcuts and hotkeys

**UI Layout & Panels**:
- [ ] Collapsible/expandable toolbar sections
- [ ] Floating panels and dockable UI elements
- [ ] Split-screen and multi-view support
- [ ] Customizable workspace layouts
- [ ] Panel auto-hide functionality

## Phase 3: Advanced Features

### 3.1 Performance Optimization
- [ ] WebGL renderer for large designs
- [ ] Spatial indexing for hit testing
- [ ] Level-of-detail rendering
- [ ] Virtual scrolling for shape lists

### 3.2 Collaboration Features
- [ ] Design versioning
- [ ] Annotation tools
- [ ] Comment system
- [ ] Change tracking

### 3.3 Template System
- [ ] Shape libraries
- [ ] Design templates
- [ ] Custom shape creation
- [ ] Import from SVG

## Testing Strategy

### Unit Tests
- Command pattern implementations
- Export format validation
- New shape geometry calculations
- Snap algorithm accuracy

### Integration Tests
- Undo/redo with all operations
- Export/import roundtrip
- Multi-shape operations
- Performance benchmarks

### Manual Testing
- Cross-browser compatibility
- Touch device support
- Large design performance
- Export quality verification

## Next Immediate Tasks

### Priority 1: Quick Visual Wins (can be done in parallel)
1. [ ] Create SVG icon system and replace emoji icons
2. [ ] Implement enhanced button states with proper hover/active feedback
3. [ ] Extend Tailwind config with custom design tokens and color palette
4. [ ] Create organized assets directory structure

### Priority 2: Essential Features (core functionality)
5. [ ] Implement UndoManager infrastructure
6. [ ] Create AddShapeCommand as proof of concept
7. [ ] Add undo/redo UI elements
8. [ ] Begin SVG export implementation
9. [ ] Design Rectangle shape class

### Priority 3: Visual Polish (after infrastructure)
10. [ ] Improve toolbar visual design with better shadows and spacing
11. [ ] Add subtle animations and transitions
12. [ ] Implement accessibility improvements (ARIA labels, focus indicators)

## Success Metrics

### Core Functionality
- [ ] Undo/redo works for all operations
- [ ] SVG export produces valid, scalable files  
- [ ] 5+ shape types available
- [ ] Grid snap accuracy < 0.1mm
- [ ] No performance regression with new features

### Visual Design & User Experience
- [ ] Professional visual appearance with consistent iconography
- [ ] Smooth, responsive interactions with proper visual feedback
- [ ] WCAG 2.1 AA accessibility compliance achieved
- [ ] Cross-browser visual consistency maintained
- [ ] Touch device usability significantly improved

### Performance & Quality
- [ ] UI animations maintain 60fps on target devices
- [ ] Design system reduces CSS bundle size through reusable components
- [ ] No visual regressions in existing functionality
- [ ] Page load time remains under 2 seconds