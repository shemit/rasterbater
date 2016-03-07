var ShaderManager = function(gl) {
  this.gl = gl;
  this.shaderProgram = this.gl.createProgram();
  this.shaderCompiler = new ShaderCompiler(this.gl);
  this.shader_ids = [];

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

  this.setShaderIds = function(ids) {
    this.shader_ids = ids;
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

    //this.gl.enableVertexAttribArray(
    //  this.gl.getAttribLocation(
    //    this.shaderProgram,
    //    "aVertexColor"
    //  )
    //);

    this.gl.enableVertexAttribArray(
      this.gl.getAttribLocation(
        this.shaderProgram,
        "aTextureCoord"
      )
    );
  }

  this.bind_buffer_to_attr = function(buffer, attribute, type) {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer.vertex_buffer);

    var vposition = this.gl.getAttribLocation(
      this.shaderProgram,
      attribute
    )

    this.gl.vertexAttribPointer(
      vposition, 
      buffer.item_size,
      type,
      false,
      0,
      0
    );
  }

  // Figure out how to make this non-dependent on the shader variable names
  this.setMatrixUniforms = function(proj_name, proj_matrix) {
    var pMatrixUniform = this.gl.getUniformLocation(
      this.shaderProgram,
      proj_name
    );

    // Set uPMatrix as this.projection_matrix
    this.gl.uniformMatrix4fv(
      pMatrixUniform, 
      false, 
      proj_matrix
    );
  }
}
