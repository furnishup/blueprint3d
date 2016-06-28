/// <reference path="../../lib/three.d.ts" />
/// <reference path="../Utils/Utils.ts" />
/// <reference path="floor_item.ts" />

module BP3D.Items {
  export var OnFloorItem = function (three, metadata, geometry, material, position, rotation, scale) {
    FloorItem.call(this, three, metadata, geometry, material, position, rotation, scale);
    this.obstructFloorMoves = false;
    this.receiveShadow = true;
  };

  OnFloorItem.prototype = Object.create(FloorItem.prototype);
}