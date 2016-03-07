var Mesh = function() {
  this.vertices = [];
  this.vertex_colors = [];
  this.rotation = [0, 0, 0];
  this.scale = [0, 0, 0];
  this.position = [0, 0, 0];
  this.texture_path = null;
  this.texture = null;
  this.texture_coords = [];
  this.rotation_velocity = [0, 0, 0];
}
