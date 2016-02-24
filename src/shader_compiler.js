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

