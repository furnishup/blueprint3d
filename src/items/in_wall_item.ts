/// <reference path="../../lib/three.d.ts" />
/// <reference path="../model/model.ts" />
/// <reference path="../utils/utils.ts" />
/// <reference path="wall_item.ts" />

module BP3D.Items {
  /** */
  export abstract class InWallItem extends WallItem {
    constructor(model: Model.Model, metadata, geometry: THREE.Geometry, material: THREE.MeshFaceMaterial, position: THREE.Vector3, rotation: number, scale: THREE.Vector3) {
      super(model, metadata, geometry, material, position, rotation, scale);
      this.addToWall = true;
    };

    /** */
    public getWallOffset() {
      // fudge factor so it saves to the right wall
      return -this.currentWallEdge.offset + 0.5;
    }
  }
}