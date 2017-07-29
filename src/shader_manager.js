var ShaderManager = function(gl) {
  this.gl = gl;
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
    this.gl.attachShader(material.shaderProgram, material.compiledFragmentShader);

  }
  
  /*
  this.setupShaders = function(mesh) {
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
        "aTextureCoord"
      )
    );
  }
  */

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
