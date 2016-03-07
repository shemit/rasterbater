function start () {
  var shader_ids = ["shader-fs", "shader-vs"]
  var canvas = document.getElementById("webgl-canvas");
  var render = new Renderer(canvas);
  render.shaderManager.setShaderIds(shader_ids);
  render.meshes = [pyramid_mesh, txt_cube_mesh];
  render.load();

  render.start();
  // render.draw();

}
