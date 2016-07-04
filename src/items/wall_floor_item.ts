var WallItem = require('./wall_item');

var WallFloorItem = function(three, metadata, geometry, material, position, rotation, scale) {
    WallItem.call(this, three, metadata, geometry, material, position, rotation, scale);
    this.boundToFloor = true;
};

WallFloorItem.prototype = Object.create(WallItem.prototype);

module.exports = WallFloorItem;
