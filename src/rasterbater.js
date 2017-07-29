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

var render;
function handleResize() {
  render.canvas.width = document.body.offsetWidth;
  render.canvas.height = document.body.offsetHeight;
}


function start () {
  var canvas = document.getElementById("webgl-canvas");
  render = new Renderer(canvas);
  handleResize();

  var mtl = new Material();
  mtl.vertexShaderSrc = "shaders/main.vs";
  mtl.fragmentShaderSrc = "shaders/main.fs";

  var mesh = txt_cube_mesh;
  mesh.material = mtl;

  render.meshes = [mesh];

  render.load();
  grender = render;
  
  window.setTimeout(go, 1000);

  document.onkeydown = handleKeyDown;
  document.onkeyup = handleKeyUp;
  window.onresize = handleResize;
}
