/// <reference path="../../lib/three.d.ts" />
/// <reference path="../model/model.ts" />
/// <reference path="../Utils/Utils.ts" />
/// <reference path="floor_item.ts" />

module BP3D.Items {
  /** */
  export abstract class OnFloorItem extends FloorItem {
    constructor(model: Model.Model, metadata, geometry: THREE.Geometry, material: THREE.Material, position: THREE.Vector3, rotation: number, scale: THREE.Vector3) {
      super(model, metadata, geometry, material, position, rotation, scale);
      this.obstructFloorMoves = false;
      this.receiveShadow = true;
    };
  }
}