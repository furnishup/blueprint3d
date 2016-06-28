/// <reference path="../../lib/three.d.ts" />
/// <reference path="../utils/utils.ts" />
/// <reference path="in_wall_item.ts" />

module BP3D.Items {
  export var InWallFloorItem = function (three, metadata, geometry, material, position, rotation, scale) {
    InWallItem.call(this, three, metadata, geometry, material, position, rotation, scale);
    this.boundToFloor = true;
  };

  InWallFloorItem.prototype = Object.create(InWallItem.prototype);
}