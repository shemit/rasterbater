var triangle = [
  0.0, 1.0, 0.0,
  -1.0, -1.0, 0.0,
  1.0, -1.0, 0.0
]

var triangle_strip = [
  1.0, 1.0, 0.0,
  -1.0, 1.0, 0.0,
  1.0, -1.0, 0.0,
  -1.0, -1.0, 0.0
]

var triangle_color = [
  1.0, 0.0, 0.0, 1.0,
  0.0, 1.0, 0.0, 1.0,
  0.0, 0.0, 1.0, 1.0
]

var triangle_strip_color = [
  0.5, 0.5, 1.0, 1.0,
  0.5, 0.5, 1.0, 1.0,
  0.5, 0.5, 1.0, 1.0,
  0.5, 0.5, 1.0, 1.0,
]

var mesh = new Mesh();
mesh.vertices = [
  0.0, 1.0, 0.0,
  -1.0, -1.0, 0.0,
  1.0, -1.0, 0.0
]
mesh.vertex_colors = [
  1.0, 0.0, 0.0, 1.0,
  0.0, 1.0, 0.0, 1.0,
  0.0, 0.0, 1.0, 1.0
]
mesh.position = [-1.5, 0.0, -7.0];



function start () {
  var shader_ids = ["shader-fs", "shader-vs"]
  var canvas = document.getElementById("webgl-canvas");
  var render = new Renderer(canvas);
  render.shader_ids = shader_ids;
  render.setupShaders();
  render.vertex_colors = [triangle_color, triangle_strip_color];
  render.meshes = [pyramid_mesh];
  render.start();
  // render.draw();

}
