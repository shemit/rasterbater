var ShaderManager = function(gl) {
  this.gl = gl;
  this.shaderCompiler = new ShaderCompiler(this.gl);
  this.shader_ids = [];

  this.useMaterial = function(material) {
    this.gl.linkProgram(material.shaderProgram);
    this.gl.useProgram(material.shaderProgram);

    // This can be made generic so that we can assign any variable within
    // the shader
    this.gl.enableVertexAttribArray(
      this.gl.getAttribLocation(
        material.shaderProgram,
        "aVertexPosition"
      )
    );

    this.gl.enableVertexAttribArray(
      this.gl.getAttribLocation(
        material.shaderProgram,
        "aTextureCoord"
      )
    );
  }

  this.enableAttributes = function(material) {
    for (attr_key in material.attributes) {
      var attribute = material.attributes[attr_key];
      this.gl.enableVertexAttribArray(
        material.shaderProgram,
        attribute.name
      );
    }
  }

  this.setupShaders = function(material) {
    material.shaderProgram = this.gl.createProgram();
    material.compiledVertexShader = this.shaderCompiler.compile(
      material.vertexShader,
      'x-shader/x-vertex'
    );

    this.gl.attachShader(material.shaderProgram, material.compiledVertexShader);

    material.compiledFragmentShader = this.shaderCompiler.compile(
      material.fragmentShader,
      'x-shader/x-fragment'
    );
    this.gl.attachShader(
      material.shaderProgram,
      material.compiledFragmentShader
    );
  }

  this.bind_buffer_to_attr = function(buffer, attribute, type, shaderProgram) {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer.vertex_buffer);

    var vposition = this.gl.getAttribLocation(
      shaderProgram,
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
  this.setMatrixUniforms = function(proj_name, proj_matrix, shaderProgram) {
    var pMatrixUniform = this.gl.getUniformLocation(
      shaderProgram,
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
