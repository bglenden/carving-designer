
// Auto-generated cross-validation test
import { Leaf } from '../src/shapes/Leaf.js';
import { TriArc } from '../src/shapes/TriArc.js';

const test_results = {
    leaf_shapes: [],
    triarc_shapes: []
};

// Test Leaf shapes

{
    const leaf = new Leaf([{"x":0,"y":0},{"x":10,"y":0}], 6.5);
    const vertices = leaf.getVertices();
    const bounds = leaf.getBounds();
    const centroid = leaf.getCentroid();
    
    test_results.leaf_shapes.push({
        name: "default_leaf",
        radius: 6.5,
        vertex_count: vertices.length,
        first_vertex: vertices[0] || null,
        last_vertex: vertices[vertices.length - 1] || null,
        bounds: bounds,
        centroid: centroid
    });
}
{
    const leaf = new Leaf([{"x":0,"y":0},{"x":0,"y":8}], 5.2);
    const vertices = leaf.getVertices();
    const bounds = leaf.getBounds();
    const centroid = leaf.getCentroid();
    
    test_results.leaf_shapes.push({
        name: "vertical_leaf",
        radius: 5.2,
        vertex_count: vertices.length,
        first_vertex: vertices[0] || null,
        last_vertex: vertices[vertices.length - 1] || null,
        bounds: bounds,
        centroid: centroid
    });
}
{
    const leaf = new Leaf([{"x":0,"y":0},{"x":6,"y":8}], 6.5);
    const vertices = leaf.getVertices();
    const bounds = leaf.getBounds();
    const centroid = leaf.getCentroid();
    
    test_results.leaf_shapes.push({
        name: "diagonal_leaf",
        radius: 6.5,
        vertex_count: vertices.length,
        first_vertex: vertices[0] || null,
        last_vertex: vertices[vertices.length - 1] || null,
        bounds: bounds,
        centroid: centroid
    });
}

// Test TriArc shapes  

{
    const triarc = new TriArc([{"x":0,"y":0},{"x":10,"y":0},{"x":5,"y":8}], [-0.125,-0.125,-0.125]);
    const vertices = triarc.getVertices();
    const bounds = triarc.getBounds();
    const centroid = triarc.getCentroid();
    
    test_results.triarc_shapes.push({
        name: "default_triangle",
        input_vertices: [{"x":0,"y":0},{"x":10,"y":0},{"x":5,"y":8}],
        curvatures: [-0.125,-0.125,-0.125],
        vertex_count: vertices.length,
        first_vertex: vertices[0] || null,
        last_vertex: vertices[vertices.length - 1] || null,
        bounds: bounds,
        centroid: centroid
    });
}
{
    const triarc = new TriArc([{"x":0,"y":0},{"x":12,"y":0},{"x":6,"y":10}], [-0.2,-0.125,-0.001]);
    const vertices = triarc.getVertices();
    const bounds = triarc.getBounds();
    const centroid = triarc.getCentroid();
    
    test_results.triarc_shapes.push({
        name: "mixed_curvatures",
        input_vertices: [{"x":0,"y":0},{"x":12,"y":0},{"x":6,"y":10}],
        curvatures: [-0.2,-0.125,-0.001],
        vertex_count: vertices.length,
        first_vertex: vertices[0] || null,
        last_vertex: vertices[vertices.length - 1] || null,
        bounds: bounds,
        centroid: centroid
    });
}
{
    const triarc = new TriArc([{"x":0,"y":0},{"x":6,"y":0},{"x":0,"y":8}], [-0.1,-0.1,-0.1]);
    const vertices = triarc.getVertices();
    const bounds = triarc.getBounds();
    const centroid = triarc.getCentroid();
    
    test_results.triarc_shapes.push({
        name: "right_triangle",
        input_vertices: [{"x":0,"y":0},{"x":6,"y":0},{"x":0,"y":8}],
        curvatures: [-0.1,-0.1,-0.1],
        vertex_count: vertices.length,
        first_vertex: vertices[0] || null,
        last_vertex: vertices[vertices.length - 1] || null,
        bounds: bounds,
        centroid: centroid
    });
}

// Output results as JSON
console.log(JSON.stringify(test_results, null, 2));
