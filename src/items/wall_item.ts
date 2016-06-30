/// <reference path="../../lib/three.d.ts" />
/// <reference path="../core/utils.ts" />
/// <reference path="../model/half_edge.ts" />
/// <reference path="../model/model.ts" />
/// <reference path="item.ts" />
/// <reference path="metadata.ts" />

namespace BP3D.Items {
  /**
   * A Wall Item is an entity to be placed related to a wall.
   */
  export abstract class WallItem extends Item {
    /** The currently applied wall edge. */
    protected currentWallEdge: Model.HalfEdge = null;
    /* TODO:
       This caused a huge headache.
       HalfEdges get destroyed/created every time floorplan is edited.
       This item should store a reference to a wall and front/back,
       and grab its edge reference dynamically whenever it needs it.
     */

    /** used for finding rotations */
    private refVec = new THREE.Vector2(0, 1.0);

    /** */
    private wallOffsetScalar = 0;

    /** */
    private sizeX = 0;

    /** */
    private sizeY = 0;

    /** */
    protected addToWall = false;

    /** */
    protected boundToFloor = false;

    /** */
    protected frontVisible = false;

    /** */
    protected backVisible = false;

    constructor(model: Model.Model, metadata: Metadata, geometry: THREE.Geometry, material: THREE.MeshFaceMaterial, position: THREE.Vector3, rotation: number, scale: THREE.Vector3) {
      super(model, metadata, geometry, material, position, rotation, scale);

      this.allowRotate = false;
    };

    /** Get the closet wall edge.
     * @returns The wall edge.
     */
    public closestWallEdge(): Model.HalfEdge {

      var wallEdges = this.model.floorplan.wallEdges();

      var wallEdge = null;
      var minDistance = null;

      var itemX = this.position.x;
      var itemZ = this.position.z;

      wallEdges.forEach((edge: Model.HalfEdge) => {
        var distance = edge.distanceTo(itemX, itemZ);
        if (minDistance === null || distance < minDistance) {
          minDistance = distance;
          wallEdge = edge;
        }
      });

      return wallEdge;
    }

    /** */
    public removed() {
      if (this.currentWallEdge != null && this.addToWall) {
        Core.Utils.removeValue(this.currentWallEdge.wall.items, this);
        this.redrawWall();
      }
    }

    /** */
    private redrawWall() {
      if (this.addToWall) {
        this.currentWallEdge.wall.fireRedraw();
      }
    }

    /** */
    private updateEdgeVisibility(visible: boolean, front: boolean) {
      if (front) {
        this.frontVisible = visible;
      } else {
        this.backVisible = visible;
      }
      this.visible = (this.frontVisible || this.backVisible);
    }

    /** */
    private updateSize() {
      this.wallOffsetScalar = (this.geometry.boundingBox.max.z - this.geometry.boundingBox.min.z) * this.scale.z / 2.0;
      this.sizeX = (this.geometry.boundingBox.max.x - this.geometry.boundingBox.min.x) * this.scale.x;
      this.sizeY = (this.geometry.boundingBox.max.y - this.geometry.boundingBox.min.y) * this.scale.y;
    }

    /** */
    public resized() {
      if (this.boundToFloor) {
        this.position.y = 0.5 * (this.geometry.boundingBox.max.y - this.geometry.boundingBox.min.y) * this.scale.y + 0.01;
      }

      this.updateSize();
      this.redrawWall();
    }

    /** */
    public placeInRoom() {
      var closestWallEdge = this.closestWallEdge();
      this.changeWallEdge(closestWallEdge);
      this.updateSize();

      if (!this.position_set) {
        // position not set
        var center = closestWallEdge.interiorCenter();
        var newPos = new THREE.Vector3(
          center.x,
          closestWallEdge.wall.height / 2.0,
          center.y);
        this.boundMove(newPos);
        this.position.copy(newPos);
        this.redrawWall();
      }
    };

    /** */
    public moveToPosition(vec3, intersection) {
      this.changeWallEdge(intersection.object.edge);
      this.boundMove(vec3);
      this.position.copy(vec3);
      this.redrawWall();
    }

    /** */
    protected getWallOffset() {
      return this.wallOffsetScalar;
    }

    /** */
    private changeWallEdge(wallEdge) {
      if (this.currentWallEdge != null) {
        if (this.addToWall) {
          Core.Utils.removeValue(this.currentWallEdge.wall.items, this);
          this.redrawWall();
        } else {
          Core.Utils.removeValue(this.currentWallEdge.wall.onItems, this);
        }
      }

      // handle subscription to wall being removed
      if (this.currentWallEdge != null) {
        this.currentWallEdge.wall.dontFireOnDelete(this.remove.bind(this));
      }
      wallEdge.wall.fireOnDelete(this.remove.bind(this));

      // find angle between wall normals
      var normal2 = new THREE.Vector2();
      var normal3 = wallEdge.plane.geometry.faces[0].normal;
      normal2.x = normal3.x;
      normal2.y = normal3.z;

      var angle = Core.Utils.angle(
        this.refVec.x, this.refVec.y,
        normal2.x, normal2.y);
      this.rotation.y = angle;

      // update currentWall
      this.currentWallEdge = wallEdge;
      if (this.addToWall) {
        wallEdge.wall.items.push(this);
        this.redrawWall();
      } else {
        wallEdge.wall.onItems.push(this);
      }
    }

    /** Returns an array of planes to use other than the ground plane
     * for passing intersection to clickPressed and clickDragged */
    public customIntersectionPlanes() {
      return this.model.floorplan.wallEdgePlanes();
    }

    /** takes the move vec3, and makes sure object stays bounded on plane */
    private boundMove(vec3) {
      var tolerance = 1;
      var edge = this.currentWallEdge;
      vec3.applyMatrix4(edge.interiorTransform);

      if (vec3.x < this.sizeX / 2.0 + tolerance) {
        vec3.x = this.sizeX / 2.0 + tolerance;
      } else if (vec3.x > (edge.interiorDistance() - this.sizeX / 2.0 - tolerance)) {
        vec3.x = edge.interiorDistance() - this.sizeX / 2.0 - tolerance;
      }

      if (this.boundToFloor) {
        vec3.y = 0.5 * (this.geometry.boundingBox.max.y - this.geometry.boundingBox.min.y) * this.scale.y + 0.01;
      } else {
        if (vec3.y < this.sizeY / 2.0 + tolerance) {
          vec3.y = this.sizeY / 2.0 + tolerance;
        } else if (vec3.y > edge.height - this.sizeY / 2.0 - tolerance) {
          vec3.y = edge.height - this.sizeY / 2.0 - tolerance;
        }
      }

      vec3.z = this.getWallOffset();

      vec3.applyMatrix4(edge.invInteriorTransform);
    }
  }
}
