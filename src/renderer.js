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
  this.elapsed_time = 0.0;

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

  this.apply_rotation = function(x_rot, y_rot, z_rot) {
      mat4.rotate(
        this.model_matrix, 
        RasterbaterMath.degrees_to_radians(x_rot), 
        [1,0,0]
      );
      mat4.rotate(
        this.model_matrix, 
        RasterbaterMath.degrees_to_radians(y_rot), 
        [0,1,0]
      );
      mat4.rotate(
        this.model_matrix, 
        RasterbaterMath.degrees_to_radians(z_rot), 
        [0,0,1]
      );
  }

  this.bind = function(elements, buffer_type, attr_name, attr_type, program) {
    var buffers = {
      "vec2_array": Vec2ArrayBuffer,
      "vec3_array": Vec3ArrayBuffer,
      "vec4_array": Vec4ArrayBuffer
    };
    var buffer = new buffers[buffer_type](
      this.gl,
      elements
    );

    buffer.bind();

    this.shaderManager.bind_buffer_to_attr(
      buffer,
      attr_name,
      attr_type,
      program
    );
  }

  this.draw_meshes = function() {
    for (m_key in this.meshes) {
      var mesh = this.meshes[m_key];

      this.shaderManager.useMaterial(mesh.material);

      mat4.translate(this.model_matrix, mesh.position);
      this.push_matrix();

      this.apply_rotation(
        mesh.rotation[0],
        mesh.rotation[1],
        mesh.rotation[2]
      );

      this.bind(
        mesh.vertices, 
        "vec3_array",
        "aVertexPosition",
        this.gl.FLOAT,
        mesh.material.shaderProgram
      );
      this.bind(
        mesh.vertex_colors, 
        "vec4_array", 
        "aVertexColor", 
        this.gl.FLOAT,
        mesh.material.shaderProgram
      );
      this.bind(
        mesh.texture_coords,
        "vec2_array",
        "aTextureCoord",
        this.gl.FLOAT,
        mesh.material.shaderProgram
      );

      //==================== texture sample ========================//

      this.gl.activeTexture(this.gl.TEXTURE0);
      this.gl.bindTexture(this.gl.TEXTURE_2D, mesh.texture);

      var usampler = this.gl.getUniformLocation(
        mesh.material.shaderProgram, 
        "uSampler"
      );
      this.gl.uniform1i(usampler, 0);

      //==================== texture sample ========================//

      this.shaderManager.setMatrixUniforms(
        "uPMatrix",
        this.projection_matrix,
        mesh.material.shaderProgram
      );

      this.shaderManager.setMatrixUniforms(
        "uMVMatrix",
        this.model_matrix,
        mesh.material.shaderProgram
      );

      // Handle meshes that include vertex_indices
      if (mesh.vertex_indices) {
        var vert_idx_buffer = new Vec1ArrayBuffer(
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
      this.elapsed_time = current_time - this.previous_tick_time;
      for (m_key in this.meshes) {
        var mesh = this.meshes[m_key];
        for (var i = 0; i < mesh.rotation.length; i++) {
          mesh.rotation[i] += (mesh.rotation_velocity[i] * this.elapsed_time) / 1000.0;
        }
      }
    }
    this.previous_tick_time = current_time;
  }

  this.draw = function() {
    this.viewport_width = this.canvas.width;
    this.viewport_height = this.canvas.height;

    this.gl.viewport(0, 0, this.viewport_width, this.viewport_height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    // Assign the projection matrix
    mat4.perspective(
      45, 
      this.viewport_width/this.viewport_height,
      0.1,
      100.0,
      this.projection_matrix
    )

    // Set the world matrix to simply be the identity
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
      mesh.material.load();
      this.shaderManager.setupShaders(mesh.material);

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
    this.tick();
  }
}
