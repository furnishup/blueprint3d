var WallItem = require('./wall_item');

var InWallItem = function(three, metadata, geometry, material, position, rotation, scale) {
    WallItem.call(this, three, metadata, geometry, material, position, rotation, scale);
    this.addToWall = true;
};

InWallItem.prototype = Object.create(WallItem.prototype);

InWallItem.prototype.getWallOffset = function() {
  // fudge factor so it saves to the right wall
  return -this.currentWallEdge.offset + 0.5;
}

module.exports = InWallItem;