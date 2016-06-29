/// <reference path="../../lib/three.d.ts" />
/// <reference path="../model/model.ts" />
/// <reference path="../utils/utils.ts" />
/// <reference path="wall_item.ts" />

module BP3D.Items {
  /** */
  export abstract class WallFloorItem extends WallItem {
    constructor(model: Model.Model, metadata, geometry: THREE.Geometry, material: THREE.Material, position: THREE.Vector3, rotation: number, scale: THREE.Vector3) {
      super(model, metadata, geometry, material, position, rotation, scale);
      this.boundToFloor = true;
    };
  }
}
