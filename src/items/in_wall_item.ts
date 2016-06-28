/// <reference path="../../lib/three.d.ts" />
/// <reference path="../utils/utils.ts" />
/// <reference path="wall_item.ts" />

module BP3D.Items {
  export var InWallItem = function (three, metadata, geometry, material, position, rotation, scale) {
    WallItem.call(this, three, metadata, geometry, material, position, rotation, scale);
    this.addToWall = true;
  };

  InWallItem.prototype = Object.create(WallItem.prototype);

  InWallItem.prototype.getWallOffset = function () {
    // fudge factor so it saves to the right wall
    return -this.currentWallEdge.offset + 0.5;
  }
}