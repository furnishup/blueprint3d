/// <reference path="../../lib/three.d.ts" />
/// <reference path="../model/model.ts" />
/// <reference path="in_wall_item.ts" />
/// <reference path="metadata.ts" />

module BP3D.Items {
  /** */
  export abstract class InWallFloorItem extends InWallItem {
    constructor(model: Model.Model, metadata: Metadata, geometry: THREE.Geometry, material: THREE.MeshFaceMaterial, position: THREE.Vector3, rotation: number, scale: THREE.Vector3) {
      super(model, metadata, geometry, material, position, rotation, scale);
      this.boundToFloor = true;
    };
  }
}