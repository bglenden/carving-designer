/**
 * Shared constants for CNC Chip Carving
 * Auto-generated from interface/constants.json - DO NOT EDIT MANUALLY
 */

// Factor for calculating default leaf radius from vertex distance
export const GEOMETRY_LEAF = {
  DEFAULTRADIUSFACTOR: 0.65,
} as const;

// TriArc curvature parameters for concave arcs
export const GEOMETRY_TRIARC = {
  DEFAULTBULGE: -0.125,
  BULGERANGEMIN: -0.2,
  BULGERANGEMAX: -0.001,
} as const;

// Floating point comparison tolerance for geometric calculations
export const GEOMETRY_EPSILON = {
  TOLERANCE: 1e-9,
} as const;

// Valid range for arc sagitta as ratio of chord length
// OpenVoronoi medial axis computation parameters
export const MEDIALAXIS = {
  DEFAULTTHRESHOLD: 0.8,
  MINCLEARANCERADIUS: 0.000001,
  MAXINTERPOLATIONDISTANCE: 2,
} as const;

// Canvas rendering and interaction parameters
export const RENDERING = {
  DEFAULTSTROKEWIDTH: 2,
  SELECTIONSTROKEWIDTH: 3,
  CONSTRUCTIONSTROKEWIDTH: 1,
  HITTESTTOLERANCE: 5,
} as const;

// Display formatting and coordinate system parameters
export const UNITS = {
  DISPLAYPRECISION: 3,
  COORDINATESCALE: 1,
} as const;
