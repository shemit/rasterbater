var square_mesh = new Mesh();
square_mesh.vertices = [
  // Front face
  -1.0, -1.0,  1.0,
   1.0, -1.0,  1.0,
   1.0,  1.0,  1.0,
  -1.0,  1.0,  1.0
];
var colors = [
    [1.0, 0.0, 0.0, 1.0] // Front face
];

square_mesh.vertex_colors = [];

for (var i in colors) {
    var color = colors[i];
    for (var j=0; j < 4; j++) {
        square_mesh.vertex_colors = square_mesh.vertex_colors.concat(color);
    }
}

square_mesh.vertex_indices = [
   0,  1,  2,    0,  2,  3
]

square_mesh.position = [-1.5, 0.0, -8.0];
square_mesh.scale = [1, 1, 1];
