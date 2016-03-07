var txt_cube_mesh = new Mesh();
txt_cube_mesh.vertices = [
  // Front face
  -1.0, -1.0,  1.0,
   1.0, -1.0,  1.0,
   1.0,  1.0,  1.0,
  -1.0,  1.0,  1.0,

  // Back face
  -1.0, -1.0, -1.0,
  -1.0,  1.0, -1.0,
   1.0,  1.0, -1.0,
   1.0, -1.0, -1.0,

  // Top face
  -1.0,  1.0, -1.0,
  -1.0,  1.0,  1.0,
   1.0,  1.0,  1.0,
   1.0,  1.0, -1.0,

  // Bottom face
  -1.0, -1.0, -1.0,
   1.0, -1.0, -1.0,
   1.0, -1.0,  1.0,
  -1.0, -1.0,  1.0,

  // Right face
   1.0, -1.0, -1.0,
   1.0,  1.0, -1.0,
   1.0,  1.0,  1.0,
   1.0, -1.0,  1.0,

  // Left face
  -1.0, -1.0, -1.0,
  -1.0, -1.0,  1.0,
  -1.0,  1.0,  1.0,
  -1.0,  1.0, -1.0
];
var colors = [
    [1.0, 0.0, 0.0, 1.0], // Front face
    [1.0, 1.0, 0.0, 1.0], // Back face
    [0.0, 1.0, 0.0, 1.0], // Top face
    [1.0, 0.5, 0.5, 1.0], // Bottom face
    [1.0, 0.0, 1.0, 1.0], // Right face
    [0.0, 0.0, 1.0, 1.0]  // Left face
];

txt_cube_mesh.vertex_colors = [];

for (var i in colors) {
    var color = colors[i];
    for (var j=0; j < 4; j++) {
        txt_cube_mesh.vertex_colors = txt_cube_mesh.vertex_colors.concat(color);
    }
}

txt_cube_mesh.vertex_indices = [
   0,  1,  2,    0,  2,  3,
   4,  5,  6,    4,  6,  7,
   8,  9, 10,    8, 10, 11,
  12, 13, 14,   12, 14, 15,
  16, 17, 18,   16, 18, 19,
  20, 21, 22,   20, 22, 23
]

txt_cube_mesh.position = [3, 0.0, 0.0];
txt_cube_mesh.scale = [1, 1, 1];
