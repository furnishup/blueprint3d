/// <reference path="../../lib/three.d.ts" />
/// <reference path="../utils/utils.ts" />
/// <reference path="wall_item.ts" />

module BP3D.Items {
  export var WallFloorItem = function (three, metadata, geometry, material, position, rotation, scale) {
    WallItem.call(this, three, metadata, geometry, material, position, rotation, scale);
    this.boundToFloor = true;
  };

  WallFloorItem.prototype = Object.create(WallItem.prototype);
}
