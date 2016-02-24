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



