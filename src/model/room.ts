/// <reference path="../../lib/three.d.ts" />
/// <reference path="../../lib/jQuery.d.ts" />
/// <reference path="../core/utils.ts" />
/// <reference path="corner.ts" />
/// <reference path="floorplan.ts" />
/// <reference path="half_edge.ts" />

/*
TODO
var Vec2 = require('vec2')
var segseg = require('segseg')
var Polygon = require('polygon')
*/

module BP3D.Model {

  /** Default texture to be used if nothing is provided. */
  const defaultRoomTexture = {
    url: "rooms/textures/hardwood.png",
    scale: 400
  }

  /** 
   * A Room is the combination of a Floorplan with a floor plane. 
   */
  export class Room {

    /** */
    public interiorCorners: Corner[] = [];

    /** */
    private edgePointer = null;

    /** floor plane for intersection testing */
    public floorPlane: THREE.Mesh = null;

    /** */
    private customTexture = false;

    /** */
    private floorChangeCallbacks = $.Callbacks();

    /**
     *  ordered CCW
     */
    constructor(private floorplan: Floorplan, public corners: Corner[]) {
      this.updateWalls();
      this.updateInteriorCorners();
      this.generatePlane();
    }

    private getUuid(): string {
      var cornerUuids = Core.Utils.map(this.corners, function (c) {
        return c.id;
      });
      cornerUuids.sort();
      return cornerUuids.join();
    }

    public fireOnFloorChange(callback) {
      this.floorChangeCallbacks.add(callback);
    }

    private getTexture() {
      var uuid = this.getUuid();
      var tex = this.floorplan.getFloorTexture(uuid);
      return tex || defaultRoomTexture;
    }

    /** 
     * textureStretch always true, just an argument for consistency with walls
     */
    private setTexture(textureUrl: string, textureStretch, textureScale: number) {
      var uuid = this.getUuid();
      this.floorplan.setFloorTexture(uuid, textureUrl, textureScale);
      this.floorChangeCallbacks.fire();
    }

    private generatePlane() {
      var points = [];
      this.interiorCorners.forEach((corner) => {
        points.push(new THREE.Vector2(
          corner.x,
          corner.y));
      });
      var shape = new THREE.Shape(points);
      var geometry = new THREE.ShapeGeometry(shape);
      this.floorPlane = new THREE.Mesh(geometry,
        new THREE.MeshBasicMaterial({
          side: THREE.DoubleSide
        }));
      this.floorPlane.visible = false;
      this.floorPlane.rotation.set(Math.PI / 2, 0, 0);
      (<any>this.floorPlane).room = this; // js monkey patch
    }

    private cycleIndex(index) {
      if (index < 0) {
        return index += this.corners.length;
      } else {
        return index % this.corners.length;
      }
    }

    private updateInteriorCorners() {
      var edge = this.edgePointer;
      while (true) {
        this.interiorCorners.push(edge.interiorStart());
        edge.generatePlane();
        if (edge.next === this.edgePointer) {
          break;
        } else {
          edge = edge.next;
        }
      }
    }

    /** 
     * Populates each wall's half edge relating to this room
     * this creates a fancy doubly connected edge list (DCEL)
     */
    private updateWalls() {

      var prevEdge = null;
      var firstEdge = null;

      for (var i = 0; i < this.corners.length; i++) {

        var firstCorner = this.corners[i];
        var secondCorner = this.corners[(i + 1) % this.corners.length];

        // find if wall is heading in that direction
        var wallTo = firstCorner.wallTo(secondCorner);
        var wallFrom = firstCorner.wallFrom(secondCorner);

        if (wallTo) {
          var edge = new HalfEdge(this, wallTo, true);
        } else if (wallFrom) {
          var edge = new HalfEdge(this, wallFrom, false);
        } else {
          // something horrible has happened
          console.log("corners arent connected by a wall, uh oh");
        }

        if (i == 0) {
          firstEdge = edge;
        } else {
          edge.prev = prevEdge;
          prevEdge.next = edge;
          if (i + 1 == this.corners.length) {
            firstEdge.prev = edge;
            edge.next = firstEdge;
          }
        }
        prevEdge = edge;
      }

      // hold on to an edge reference
      this.edgePointer = firstEdge;
    }
  }
}
