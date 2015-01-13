/*
 * Currently dependent on glMatrix.js
 *
 */

var Buffer = function(gl, vertices, item_size, num_items) {
  this.gl = gl;
  this.vertex_buffer = gl.createBuffer();
  this.vertices = vertices;
  this.item_size = item_size;
  this.num_items = num_items;
}

Buffer.prototype.bind = function() {
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertex_buffer);
  this.gl.bufferData(
    this.gl.ARRAY_BUFFER,
    new Float32Array(this.vertices),
    this.gl.STATIC_DRAW
  );
}

var ColorBuffer = function(gl, colors) {
  Buffer.call(this, gl, colors, 4, colors.length/4);
}
ColorBuffer.prototype = Object.create(Buffer.prototype);

/* Inherit from Buffer */
var TriangleBuffer = function(gl, vertices) {
  Buffer.call(this, gl, vertices, 3, 3);
}
TriangleBuffer.prototype = Object.create(Buffer.prototype);

var TriangleStripBuffer = function(gl, vertices, numItems) {
  Buffer.call(this, gl, vertices, 3, numItems);
}
TriangleStripBuffer.prototype = Object.create(Buffer.prototype);

var ShaderCompiler = function(gl) {
  this.gl = gl;
  this.shader_types = {
    "x-shader/x-fragment": this.gl.FRAGMENT_SHADER,
    "x-shader/x-vertex": this.gl.VERTEX_SHADER
  }
}

var Mesh = function() {
  this.vertices = [];
  this.vertex_colors = [];
  this.rotation = [0, 0, 0];
  this.scale = [0, 0, 0];
  this.position = [0, 0, 0];
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

var RasterbaterMath = {
  "degrees_to_radians": function(degrees) {
    return degrees * Math.PI / 180;
  }
}

var Renderer = function(canvas) {
  this.shader_ids = [];
  this.canvas = canvas;

  this.gl = this.canvas.getContext("experimental-webgl");
  this.shaderProgram = this.gl.createProgram();
  this.shaderCompiler = new ShaderCompiler(this.gl);
  this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
  this.gl.enable(this.gl.DEPTH_TEST);

  this.viewport_width = this.canvas.width;
  this.viewport_height = this.canvas.height;

  this.triangles = [];
  this.triangle_strips = [];

  this.meshes = [];
  this.model_matrix_stack = [];

  this.vertex_colors = [];

  this.projection_matrix = mat4.create();
  this.model_matrix = mat4.create();
  this.previous_tick_time = 0.0;

  this.buffer_types = {
    "triangle": this.gl.TRIANGLES,
    "triangle_strip": this.gl.TRIANGLE_STRIP
  }
  var _this = this;

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

    // This can be made generic so that we can assign any variable within
    // the shader
    this.gl.enableVertexAttribArray(
      this.gl.getAttribLocation(
        this.shaderProgram,
        "aVertexPosition"
      )
    );

    this.gl.enableVertexAttribArray(
      this.gl.getAttribLocation(
        this.shaderProgram,
        "aVertexColor"
      )
    );
  }

  // Figure out how to make this non-dependent on the shader variable names
  this.setMatrixUniforms = function() {
    var pMatrixUniform = this.gl.getUniformLocation(
      this.shaderProgram,
      "uPMatrix"
    );
    var mvMatrixUniform = this.gl.getUniformLocation(
      this.shaderProgram,
      "uMVMatrix"
    )

    // Set uPMatrix as this.projection_matrix
    this.gl.uniformMatrix4fv(
      pMatrixUniform, 
      false, 
      this.projection_matrix
    );

    // Set uMVMatrix as this.model_matrix
    this.gl.uniformMatrix4fv(
      mvMatrixUniform,
      false,
      this.model_matrix
    );
  }

  this.draw_buffer = function(buffer, type, attribute) {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer.vertex_buffer);
    var vposition = this.gl.getAttribLocation(
      this.shaderProgram,
      attribute
    )

    this.gl.vertexAttribPointer(
      vposition, 
      buffer.item_size,
      this.gl.FLOAT,
      false,
      0,
      0
    );

    if (type != null) {
      this.setMatrixUniforms();
      this.gl.drawArrays(this.buffer_types[type], 0, buffer.num_items);
    }
  }

  this.draw_triangles = function(position, rotation, scale) {
    var triangle_color = new ColorBuffer(this.gl, this.vertex_colors[0]);
    triangle_color.bind();
    this.draw_buffer(triangle_color, null, "aVertexColor");

    var triangle_buffer = new TriangleBuffer(this.gl, []);
    for (triangle_key in this.triangles) {
      var triangle = this.triangles[triangle_key];
      triangle_buffer.vertices = triangle;
      triangle_buffer.bind();
      this.draw_buffer(triangle_buffer, "triangle", "aVertexPosition");
    }
  }

  this.draw_triangle_strips = function(position, rotation, scale) {
    // Put the color into the buffer
    var triangle_strip_color = new ColorBuffer(this.gl, this.vertex_colors[1]);
    triangle_strip_color.bind();
    this.draw_buffer(triangle_strip_color, null, "aVertexColor");

    // Put the triangle strip into the buffer
    // mat4.translate(this.model_matrix, [3.0, 0.0, 0.0]);
    var triangle_strip_buffer = new TriangleStripBuffer(this.gl, [], 0);
    for (ts_key in this.triangle_strips) {
      var ts = this.triangle_strips[ts_key];
      triangle_strip_buffer.vertices = ts;
      triangle_strip_buffer.num_items = ts.length / 3;
      triangle_strip_buffer.bind();
      this.draw_buffer(
        triangle_strip_buffer,
        "triangle_strip", 
        "aVertexPosition"
      );
    }
  }

  this.push_matrix = function() {
    var copy = mat4.create();
    mat4.set(this.model_matrix, copy);
    this.model_matrix_stack.push(copy);
  }

  this.pop_matrix = function() {
    if (this.model_matrix_stack.length == 0) {
      throw "Invalid popmatrix.";
    }
    this.model_matrix = this.model_matrix_stack.pop();
  }

  this.draw_meshes = function() {
    var triangle_strip_buffer = new TriangleStripBuffer(this.gl, [], 0);
    for (m_key in this.meshes) {
      var mesh = this.meshes[m_key];

      mat4.translate(this.model_matrix, mesh.position);
      this.push_matrix();

      console.log(mesh.rotation[0]);

      mat4.rotate(
        this.model_matrix, 
        RasterbaterMath.degrees_to_radians(mesh.rotation[0]), 
        [1,0,0]
      );

      var triangle_strip_color = new ColorBuffer(
        this.gl, 
        mesh.vertex_colors
      );
      triangle_strip_color.bind();
      this.draw_buffer(triangle_strip_color, null, "aVertexColor");

      triangle_strip_buffer.vertices = mesh.vertices;
      
      triangle_strip_buffer.num_items = mesh.vertices.length / 3;
      triangle_strip_buffer.bind();

      this.draw_buffer(
        triangle_strip_buffer,
        "triangle_strip", 
        "aVertexPosition"
      );
      this.pop_matrix();

    }
  }

  this.animate = function() {
    var current_time = new Date().getTime();
    if (this.previous_tick_time != 0) {
      var elapsed = current_time - this.previous_tick_time;
      for (m_key in this.meshes) {
        var mesh = this.meshes[m_key];
        mesh.rotation[0] += (90 * elapsed) / 1000.0;
      }
    }
    this.previous_tick_time = current_time;
  }

  this.draw = function() {
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

    this.draw_triangles();
    this.draw_triangle_strips();
    this.draw_meshes();
  }

  this.tick = function() {
    requestAnimFrame(_this.tick);
    _this.draw();
    _this.animate();
  }

  this.start = function() {
    this.tick();
  }
}
