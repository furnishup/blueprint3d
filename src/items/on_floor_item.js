var FloorItem = require('./floor_item');

var OnFloorItem = function(three, metadata, geometry, material, position, rotation, scale) {
    FloorItem.call(this, three, metadata, geometry, material, position, rotation, scale);
    this.obstructFloorMoves = false;
    this.receiveShadow = true;
};

OnFloorItem.prototype = Object.create(FloorItem.prototype);

module.exports = OnFloorItem;