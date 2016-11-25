var ShaderAttribute = function(name, type, value) {
  this.name = name;
  this.type = type;
  this.value = value;
}

var Shader = function(gl, compiled) {
  this.attributes = [];
  this.compiled = compiled;
}
