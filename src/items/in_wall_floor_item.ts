var InWallItem = require('./in_wall_item');

var InWallFloorItem = function(three, metadata, geometry, material, position, rotation, scale) {
    InWallItem.call(this, three, metadata, geometry, material, position, rotation, scale);
    this.boundToFloor = true;
};

InWallFloorItem.prototype = Object.create(InWallItem.prototype);

module.exports = InWallFloorItem;