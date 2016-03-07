var Buffer = function(
    gl, 
    vertices,
    item_size,
    num_items,
    buffer_type, 
    prim_type
  ) {
  this.gl = gl;
  this.vertex_buffer = gl.createBuffer();
  this.vertices = vertices;
  this.item_size = item_size;
  this.num_items = num_items;
  this.type = buffer_type;
  this.prim_type = prim_type;
}

Buffer.prototype.bind = function() {
  this.gl.bindBuffer(this.type, this.vertex_buffer);
  this.gl.bufferData(
    this.type,
    new this.prim_type(this.vertices),
    this.gl.STATIC_DRAW
  )
}

var VertexIndexBuffer = function(
    gl,
    indices
  ) {

  Buffer.call(
    this,
    gl,
    indices,
    1,
    indices.length,
    gl.ELEMENT_ARRAY_BUFFER,
    Uint16Array
  );
}
VertexIndexBuffer.prototype = Object.create(Buffer.prototype);

var ColorBuffer = function(gl, colors) {
  Buffer.call(
    this,
    gl,
    colors,
    4,
    colors.length/4,
    gl.ARRAY_BUFFER,
    Float32Array
  );
}
ColorBuffer.prototype = Object.create(Buffer.prototype);

/* Inherit from Buffer */
var TriangleBuffer = function(gl, vertices) {
  Buffer.call(this, gl, vertices, 3, vertices.length/3, gl.ARRAY_BUFFER, Float32Array);
}
TriangleBuffer.prototype = Object.create(Buffer.prototype);
