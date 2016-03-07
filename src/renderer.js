/*
 * Currently dependent on glMatrix.js
 *
 */
var Renderer = function(canvas) {
  this.shader_ids = [];
  this.canvas = canvas;

  this.gl = this.canvas.getContext("experimental-webgl");
  this.shaderManager = new ShaderManager(this.gl)
  this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
  this.gl.enable(this.gl.DEPTH_TEST);

  this.viewport_width = this.canvas.width;
  this.viewport_height = this.canvas.height;

  this.meshes = [];
  this.model_matrix_stack = [];

  this.projection_matrix = mat4.create();
  this.model_matrix = mat4.create();
  this.previous_tick_time = 0.0;

  var _this = this;

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
    for (m_key in this.meshes) {
      var mesh = this.meshes[m_key];

      mat4.translate(this.model_matrix, mesh.position);
      this.push_matrix();

      mat4.rotate(
        this.model_matrix, 
        RasterbaterMath.degrees_to_radians(mesh.rotation[0]), 
        [1,0,0]
      );

      var vert_pos_buffer = new TriangleBuffer(
        this.gl,
        mesh.vertices
      );
      vert_pos_buffer.bind();
      this.shaderManager.bind_buffer_to_attr(
        vert_pos_buffer,
        "aVertexPosition",
        this.gl.FLOAT
      );

      if (mesh.vertex_colors.length > 0) {
        var vert_color_buffer = new ColorBuffer(
          this.gl,
          mesh.vertex_colors
        )

        vert_color_buffer.bind();
        this.shaderManager.bind_buffer_to_attr(
          vert_color_buffer,
          "aVertexColor",
          this.gl.FLOAT
        );
      }

      if (mesh.texture_coords.length > 0) {

        var txt_coord_buffer = new TextureCoordinateBuffer(
          this.gl,
          mesh.texture_coords
        );
        txt_coord_buffer.bind();

        this.shaderManager.bind_buffer_to_attr(
          txt_coord_buffer,
          "aTextureCoord",
          this.gl.FLOAT
        );

        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, mesh.texture);

        var usampler = this.gl.getUniformLocation(
          this.shaderManager.shaderProgram, 
          "uSampler"
        );
        this.gl.uniform1i(usampler, 0);
      }

      this.shaderManager.setMatrixUniforms(
        "uPMatrix",
        this.projection_matrix
      );

      this.shaderManager.setMatrixUniforms(
        "uMVMatrix",
        this.model_matrix
      );

      // Handle meshes that include vertex_indices
      if (mesh.vertex_indices) {
        var vert_idx_buffer = new VertexIndexBuffer(
          this.gl,
          mesh.vertex_indices
        );
        vert_idx_buffer.bind();

        this.gl.drawElements(
          this.gl.TRIANGLES,
          vert_idx_buffer.num_items,
          this.gl.UNSIGNED_SHORT,
          0
        );
      }

      // Handle meshes that don't include vertex_indices
      else {
        this.gl.drawArrays(
          this.gl.TRIANGLE_STRIP,
          0,
          vert_pos_buffer.num_items);
      }
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

    this.draw_meshes();
  }

  this.tick = function() {
    requestAnimFrame(_this.tick);
    _this.draw();
    _this.animate();
  }

  this.handleLoadedTexture = function(texture) {
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);

    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl.RGBA,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      texture.image
    );

    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_MAG_FILTER,
      this.gl.NEAREST
    );

    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_MIN_FILTER,
      this.gl.NEAREST
    );

    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
  }
  
  this.load = function() {
    for (mesh_key in this.meshes) {
      var mesh = this.meshes[mesh_key];

      if (mesh.texture_path) {
        mesh.texture = this.gl.createTexture();
        mesh.texture.image = new Image();
        mesh.texture.image.onload = function() {
          _this.handleLoadedTexture(mesh.texture);
        }
        mesh.texture.image.src = mesh.texture_path;
      }
    }
  }

  this.start = function() {
    this.shaderManager.setupShaders();
    this.tick();
  }
}
