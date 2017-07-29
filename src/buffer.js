var Buffer = function(
    gl, 
    elements,
    item_size,
    num_items,
    buffer_type, 
    prim_type
  ) {
  this.gl = gl;
  this.vertex_buffer = gl.createBuffer();
  this.elements = elements;
  this.item_size = item_size;
  this.num_items = num_items;
  this.type = buffer_type;
  this.prim_type = prim_type;
}

Buffer.prototype.bind = function() {
  this.gl.bindBuffer(this.type, this.vertex_buffer);
  this.gl.bufferData(
    this.type,
    new this.prim_type(this.elements),
    this.gl.STATIC_DRAW
  )
}

var Vec1ArrayBuffer = function(
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
Vec1ArrayBuffer.prototype = Object.create(Buffer.prototype);

var Vec2ArrayBuffer = function(gl, coords) {
  Buffer.call(
    this,
    gl,
    coords,
    2,
    coords.length/2,
    gl.ARRAY_BUFFER,
    Float32Array
  );
}
Vec2ArrayBuffer.prototype = Object.create(Buffer.prototype);

var Vec3ArrayBuffer = function(gl, vertices) {
  Buffer.call(
    this,
    gl,
    vertices,
    3,
    vertices.length/3,
    gl.ARRAY_BUFFER,
    Float32Array
  );
}
Vec3ArrayBuffer.prototype = Object.create(Buffer.prototype);

var Vec4ArrayBuffer = function(gl, colors) {
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
Vec4ArrayBuffer.prototype = Object.create(Buffer.prototype);

var TextureBuffer = function(gl, texture) {
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
TextureBuffer.prototype = Object.create(Buffer.prototype);

TextureBuffer.prototype.bind = function() {
}

