/*
 * Currently dependent on glMatrix.js
 *
 */

var TriangleBuffer = function(gl) {
  this.vertex_buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer);
  this.vertices = [
    0.0,   1.0, 0.0,
    -1.0, -1.0, 0.0,
    1.0,  -1.0, 0.0,
  ];
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(this.vertices),
    gl.STATIC_DRAW
  );
  this.item_size = 3;
  this.num_items = 3;
}

var ShaderCompiler = function(gl) {
  this.gl = gl;
  this.shader_types = {
    "x-shader/x-fragment": this.gl.FRAGMENT_SHADER,
    "x-shader/x-vertex": this.gl.VERTEX_SHADER
  }
}

ShaderCompiler.prototype.compile = function(shader_str, shader_type) {
  var gl_shader_type = this.shader_types[shader_type];
  var shader = this.gl.createShader(gl_shader_type);

  this.gl.shaderSource(shader, shader_str);
  this.gl.compileShader(shader);

  if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
    alert(this.gl.getShaderInfoLog(shader));
    return null;

  }
  return shader;
}

var Renderer = function(canvas) {
  this.shader_ids = [];
  this.canvas = canvas;

  this.gl = this.canvas.getContext("experimental-webgl");
  this.shaderProgram = this.gl.createProgram();
  this.shaderCompiler = new ShaderCompiler(this.gl);

  this.viewport_width = this.canvas.width;
  this.viewport_height = this.canvas.height;
  this.triangle_buffers = [];

  this.projection_matrix = mat4.create();
  this.model_matrix = mat4.create();

  this.getShaderStrById = function(id) {
    var shader_str_elem = document.getElementById(id);

    var str = "";
    var k = shader_str_elem.firstChild;
    while(k) {
      if (k.nodeType == 3) {
        str += k.textContent;
      }
      k = k.nextSibling;
    }

    return str;
  }

  this.getShaderTypeById = function(id) {
    var shader_str_elem = document.getElementById(id);
    return shader_str_elem.type;
  }

  this.setupShaders = function() {
    for (shader_key in this.shader_ids) {
      var shader_id = this.shader_ids[shader_key];
      var shader_str = this.getShaderStrById(shader_id);
      var shader_type = this.getShaderTypeById(shader_id);

      var shader = this.shaderCompiler.compile(shader_str, shader_type);
      this.gl.attachShader(this.shaderProgram, shader);
    }

    this.gl.linkProgram(this.shaderProgram);
    this.gl.useProgram(this.shaderProgram);

    this.gl.enableVertexAttribArray(
      this.gl.getAttribLocation(
        this.shaderProgram,
        "aVertexPosition"
      )
    );
  }

  this.setMatrixUniforms = function() {
    var pMatrixUniform = this.gl.getUniformLocation(
      this.shaderProgram,
      "uPMatrix"
    );

    var mvMatrixUniform = this.gl.getUniformLocation(
      this.shaderProgram,
      "uMVMatrix"
    )
    this.gl.uniformMatrix4fv(
      pMatrixUniform, 
      false, 
      this.projection_matrix
    );
    this.gl.uniformMatrix4fv(
      mvMatrixUniform,
      false,
      this.model_matrix
    );
  }

  this.draw = function() {
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.viewport(0, 0, this.viewport_width, this.viewport_height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    mat4.perspective(
      45, 
      this.viewport_width/this.viewport_height,
      0.1,
      100.0,
      this.projection_matrix
    )

    mat4.identity(this.model_matrix);
    mat4.translate(this.model_matrix, [-1.5, 0.0, -7.0]);

    for (buffer_key in this.triangle_buffers) {
      var buffer = this.triangle_buffers[buffer_key];
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer.vertex_buffer);

      var vposition = this.gl.getAttribLocation(
        this.shaderProgram,
        "aVertexPosition"
      )

      console.log(buffer);
      this.gl.vertexAttribPointer(
        vposition, 
        buffer.item_size,
        this.gl.FLOAT,
        false,
        0,
        0
      );

      this.setMatrixUniforms();
      this.gl.drawArrays(this.gl.TRIANGLES, 0, buffer.num_items);
    }
  }
}

function start() {
  var shader_ids = ["shader-fs", "shader-vs"]
  var canvas = document.getElementById("webgl-canvas");
  var render = new Renderer(canvas);

  render.shader_ids = shader_ids;
  render.setupShaders();
  render.triangle_buffers = [new TriangleBuffer(render.gl)]
  render.draw()
}
