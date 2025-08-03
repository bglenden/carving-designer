import { DesignData } from './PersistenceManager.js';

export class SchemaValidator {
  /**
   * Validates a design data object against the expected schema
   */
  public static validateDesignData(data: any): data is DesignData {
    try {
      // Check if data is an object
      if (!data || typeof data !== 'object') {
        console.warn('Design data is not an object');
        return false;
      }

      // Check required version field
      if (!data.version || typeof data.version !== 'string') {
        console.warn('Design data missing or invalid version field');
        return false;
      }

      // Check for supported version
      if (data.version !== '2.0') {
        console.warn(`Unsupported version: ${data.version}. Expected version 2.0`);
        return false;
      }

      // Check shapes array
      if (!Array.isArray(data.shapes)) {
        console.warn('Design data shapes field is not an array');
        return false;
      }

      // Validate each shape has required fields
      for (const shape of data.shapes) {
        if (!shape || typeof shape !== 'object') {
          console.warn('Invalid shape object in design data');
          return false;
        }

        if (!shape.type || typeof shape.type !== 'string') {
          console.warn('Shape missing type field');
          return false;
        }

        // Basic validation for different shape types
        switch (shape.type) {
          case 'LEAF':
            if (!Array.isArray(shape.vertices) || shape.vertices.length !== 2) {
              console.warn('Leaf shape missing valid vertices array');
              return false;
            }
            for (const vertex of shape.vertices) {
              if (!vertex || typeof vertex.x !== 'number' || typeof vertex.y !== 'number') {
                console.warn('Leaf shape has invalid vertex');
                return false;
              }
            }
            if (typeof shape.radius !== 'number' || shape.radius <= 0) {
              console.warn('Leaf shape missing valid radius');
              return false;
            }
            break;
          case 'TRI_ARC':
            if (!Array.isArray(shape.vertices) || shape.vertices.length !== 3) {
              console.warn('TriArc shape missing valid vertices array');
              return false;
            }
            for (const vertex of shape.vertices) {
              if (!vertex || typeof vertex.x !== 'number' || typeof vertex.y !== 'number') {
                console.warn('TriArc shape has invalid vertex');
                return false;
              }
            }
            if (!Array.isArray(shape.curvatures) || shape.curvatures.length !== 3) {
              console.warn('TriArc shape missing valid curvatures array');
              return false;
            }
            for (const curvature of shape.curvatures) {
              if (typeof curvature !== 'number') {
                console.warn('TriArc shape has invalid curvature value');
                return false;
              }
            }
            break;
        }
      }

      // Check background images array (optional)
      if (data.backgroundImages !== undefined) {
        if (!Array.isArray(data.backgroundImages)) {
          console.warn('Design data backgroundImages field is not an array');
          return false;
        }

        // Validate each background image
        for (const bgImage of data.backgroundImages) {
          if (!bgImage || typeof bgImage !== 'object') {
            console.warn('Invalid background image object');
            return false;
          }

          if (!bgImage.id || typeof bgImage.id !== 'string') {
            console.warn('Background image missing id');
            return false;
          }

          if (!bgImage.imageData || typeof bgImage.imageData !== 'string') {
            console.warn('Background image missing imageData');
            return false;
          }
        }
      }

      // Validate metadata if present
      if (data.metadata !== undefined) {
        if (typeof data.metadata !== 'object') {
          console.warn('Design metadata is not an object');
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error validating design data:', error);
      return false;
    }
  }

  /**
   * Gets the schema version that this validator supports
   */
  public static getSupportedVersion(): string {
    return '2.0';
  }

  /**
   * Checks if a file extension is supported
   */
  public static isSupportedFileExtension(filename: string): boolean {
    return filename.toLowerCase().endsWith('.json');
  }
}
