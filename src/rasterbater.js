var grender = null;

function go() {
  grender.start();
}

function handleKeyDown() {
  console.log('hello world');
  
}

function handleKeyUp() {
  console.log('goodbye world');

}

function start () {
  var shader_ids = ["shader-fs", "shader-vs"]
  var canvas = document.getElementById("webgl-canvas");
  var render = new Renderer(canvas);

  render.shaderManager.setShaderIds(shader_ids);
  render.meshes = [txt_cube_mesh];
  render.load();
  grender = render;
  window.setTimeout(go, 1000);

  document.onkeydown = handleKeyDown;
  document.onkeyup = handleKeyUp;

  // render.draw();

}
