/// <reference path="../../lib/jQuery.d.ts" />
/// <reference path="../../lib/three.d.ts" />
/// <reference path="../Utils/Utils.ts" />
/// <reference path="wall.ts" />
/// <reference path="corner.ts" />
/// <reference path="room.ts" />
/// <reference path="half_edge.ts" />

module BP3D.Model {
  /** */
  const defaultTolerance = 10.0;

  /** */
  export class Floorplan {

    /** */
    private walls: Wall[] = [];

    /** */
    private corners: Corner[] = [];

    /** */
    private rooms: Room[] = [];

    /** */
    private new_wall_callbacks: JQueryCallback;

    /** */
    private new_corner_callbacks: JQueryCallback;

    /** */
    private redraw_callbacks: JQueryCallback;

    /** */
    private updated_rooms: JQueryCallback;

    /** */
    private roomLoadedCallbacks: JQueryCallback;

    /** */
    private floorTextures: {};

    /** Constructs a floorplan. */
    constructor() {

      // Track floor textures here, since rooms are destroyed and
      // created each time we change the floorplan.
      this.floorTextures = {};

      this.new_wall_callbacks = $.Callbacks();
      this.new_corner_callbacks = $.Callbacks();
      this.redraw_callbacks = $.Callbacks();
      this.updated_rooms = $.Callbacks();
      this.roomLoadedCallbacks = $.Callbacks();
    }

    // hack
    private wallEdges() {
      var edges = []
      Utils.forEach(this.walls, (wall) => {
        if (wall.frontEdge) {
          edges.push(wall.frontEdge);
        }
        if (wall.backEdge) {
          edges.push(wall.backEdge);
        }
      });
      return edges;
    }

    // hack
    private wallEdgePlanes() {
      var planes = []
      Utils.forEach(this.walls, (wall) => {
        if (wall.frontEdge) {
          planes.push(wall.frontEdge.plane);
        }
        if (wall.backEdge) {
          planes.push(wall.backEdge.plane);
        }
      });
      return planes;
    }

    private floorPlanes() {
      return Utils.map(this.rooms, (room) => {
        return room.floorPlane;
      });
    }

    public fireOnNewWall(callback) {
      this.new_wall_callbacks.add(callback);
    }

    public fireOnNewCorner(callback) {
      this.new_corner_callbacks.add(callback);
    }

    public fireOnRedraw(callback) {
      this.redraw_callbacks.add(callback);
    }

    public fireOnUpdatedRooms(callback) {
      this.updated_rooms.add(callback);
    }

    private newWall(start: Corner, end: Corner) {
      var wall = new Wall(start, end);
      this.walls.push(wall)
      wall.fireOnDelete(this.removeWall);
      this.new_wall_callbacks.fire(wall);
      this.update();
      return wall;
    }

    private removeWall(wall) {
      Utils.removeValue(this.walls, wall);
      this.update();
    }

    private newCorner(x: number, y: number, id: string) {
      var corner = new Corner(this, x, y, id);
      this.corners.push(corner);
      corner.fireOnDelete(this.removeCorner);
      this.new_corner_callbacks.fire(corner);
      return corner;
    }

    private removeCorner(corner: Corner) {
      Utils.removeValue(this.corners, corner);
    }

    public getWalls() {
      return this.walls;
    }

    public getCorners() {
      return this.corners;
    }

    public getRooms() {
      return this.rooms;
    }

    private overlappedCorner(x: number, y: number, tolerance: number): Corner {
      tolerance = tolerance || defaultTolerance;
      for (var i = 0; i < this.corners.length; i++) {
        if (this.corners[i].distanceFrom(x, y) < tolerance) {
          //console.log("got corner")
          return this.corners[i];
        }
      }
      return null;
    }

    private overlappedWall(x: number, y: number, tolerance: number): any {
      tolerance = tolerance || defaultTolerance;
      for (var i = 0; i < this.walls.length; i++) {
        if (this.walls[i].distanceFrom(x, y) < tolerance) {
          return this.walls[i];
        }
      }
      return null;
    }

    // import and export -- cleanup

    public saveFloorplan() {
      var floorplan = {
        corners: {},
        walls: [],
        wallTextures: [],
        floorTextures: {},
        newFloorTextures: {}
      }
      Utils.forEach(this.corners, function (corner) {
        floorplan.corners[corner.id] = {
          'x': corner.x,
          'y': corner.y
        };
      });
      Utils.forEach(this.walls, function (wall) {
        floorplan.walls.push({
          'corner1': wall.getStart().id,
          'corner2': wall.getEnd().id,
          'frontTexture': wall.frontTexture,
          'backTexture': wall.backTexture
        });
      });
      floorplan.newFloorTextures = this.floorTextures;
      return floorplan;
    }

    public loadFloorplan(floorplan) {
      this.reset();

      var corners = {};
      if (floorplan == null || !('corners' in floorplan) || !('walls' in floorplan)) {
        return
      }
      for (var id in floorplan.corners) {
        var corner = floorplan.corners[id];
        corners[id] = this.newCorner(corner.x, corner.y, id);
      }
      var scope = this;
      Utils.forEach(floorplan.walls, function (wall) {
        var newWall = scope.newWall(
          corners[wall.corner1], corners[wall.corner2]);
        if (wall.frontTexture) {
          newWall.frontTexture = wall.frontTexture;
        }
        if (wall.backTexture) {
          newWall.backTexture = wall.backTexture;
        }
      });

      if ('newFloorTextures' in floorplan) {
        this.floorTextures = floorplan.newFloorTextures;
      }

      this.update();
      this.roomLoadedCallbacks.fire();
    }

    public getFloorTexture(uuid: string) {
      if (uuid in this.floorTextures) {
        return this.floorTextures[uuid];
      } else {
        return null;
      }
    }

    public setFloorTexture(uuid: string, url: string, scale: number) {
      this.floorTextures[uuid] = {
        url: url,
        scale: scale
      }
    }

    // clear out obsolete floor textures
    private updateFloorTextures() {
      var uuids = Utils.map(this.rooms, function (room) {
        return room.getUuid();
      });
      for (var uuid in this.floorTextures) {
        if (!Utils.hasValue(uuids, uuid)) {
          delete this.floorTextures[uuid]
        }
      }
    }

    private reset() {
      var tmpCorners = this.corners.slice(0);
      var tmpWalls = this.walls.slice(0);
      Utils.forEach(tmpCorners, function (c) {
        c.remove();
      })
      Utils.forEach(tmpWalls, function (w) {
        w.remove();
      })
      this.corners = [];
      this.walls = [];
    }

    /** 
     * Update rooms
     */
    private update() {

      Utils.forEach(this.walls, function (wall) {
        wall.resetFrontBack();
      });

      var roomCorners = findRooms(this.corners);
      this.rooms = [];
      var scope = this;
      Utils.forEach(roomCorners, function (corners) {
        this.rooms.push(new Room(scope, corners));
      });
      this.assignOrphanEdges();

      this.updateFloorTextures();
      this.updated_rooms.fire();
    }

    /** 
     * Returns the center of the floorplan in the y plane
     */
    private getCenter() {
      return this.getDimensions(true);
    }

    private getSize() {
      return this.getDimensions(false);
    }

    private getDimensions(center) {
      center = center || false; // otherwise, get size

      var xMin = Infinity;
      var xMax = -Infinity;
      var zMin = Infinity;
      var zMax = -Infinity;
      Utils.forEach(this.corners, function (c) {
        if (c.x < xMin) xMin = c.x;
        if (c.x > xMax) xMax = c.x;
        if (c.y < zMin) zMin = c.y;
        if (c.y > zMax) zMax = c.y;
      });
      var ret;
      if (xMin == Infinity || xMax == -Infinity || zMin == Infinity || zMax == -Infinity) {
        ret = new THREE.Vector3();
      } else {
        if (center) {
          // center
          ret = new THREE.Vector3((xMin + xMax) * 0.5, 0, (zMin + zMax) * 0.5);
        } else {
          // size
          ret = new THREE.Vector3((xMax - xMin), 0, (zMax - zMin));
        }
      }
      return ret;
    }

    private assignOrphanEdges() {
      // kinda hacky
      // find orphaned wall segments (i.e. not part of rooms) and
      // give them edges
      var orphanWalls = []
      Utils.forEach(this.walls, function (wall) {
        if (!wall.backEdge && !wall.frontEdge) {
          wall.orphan = true;
          var back = new HalfEdge(null, wall, false);
          back.generatePlane();
          var front = new HalfEdge(null, wall, true);
          front.generatePlane();
          orphanWalls.push(wall);
        }
      });

    }

  };

  /*
   * Find the "rooms" in our planar straight-line graph.
   * Rooms are set of the smallest (by area) possible cycles in this graph.
   */
  // corners has attributes: id, x, y, adjacents
  function findRooms(corners) {

    function calculateTheta(previousCorner, currentCorner, nextCorner) {
      var theta = Utils.angle2pi(
        previousCorner.x - currentCorner.x,
        previousCorner.y - currentCorner.y,
        nextCorner.x - currentCorner.x,
        nextCorner.y - currentCorner.y);
      return theta;
    }

    function removeDuplicateRooms(roomArray) {
      var results = [];
      var lookup = {};
      var hashFunc = function (corner) {
        return corner.id
      };
      var sep = '-';
      for (var i = 0; i < roomArray.length; i++) {
        // rooms are cycles, shift it around to check uniqueness
        var add = true;
        var room = roomArray[i];
        for (var j = 0; j < room.length; j++) {
          var roomShift = Utils.cycle(room, j);
          var str = Utils.map(roomShift, hashFunc).join(sep);
          if (lookup.hasOwnProperty(str)) {
            add = false;
          }
        }
        if (add) {
          results.push(roomArray[i]);
          lookup[str] = true;
        }
      }
      return results;
    }

    function findTightestCycle(firstCorner, secondCorner) {
      var stack = [];
      var next = {
        corner: secondCorner,
        previousCorners: [firstCorner]
      };
      var visited = {};
      visited[firstCorner.id] = true;

      while (next) {
        // update previous corners, current corner, and visited corners
        var currentCorner = next.corner;
        visited[currentCorner.id] = true;

        // did we make it back to the startCorner?
        if (next.corner === firstCorner && currentCorner !== secondCorner) {
          return next.previousCorners;
        }

        var addToStack = [];
        var adjacentCorners = next.corner.adjacentCorners();
        for (var i = 0; i < adjacentCorners.length; i++) {
          var nextCorner = adjacentCorners[i];

          // is this where we came from?
          // give an exception if its the first corner and we aren't at the second corner
          if (nextCorner.id in visited &&
            !(nextCorner === firstCorner && currentCorner !== secondCorner)) {
            continue;
          }

          // nope, throw it on the queue  
          addToStack.push(nextCorner);
        }

        var previousCorners = next.previousCorners.slice(0);
        previousCorners.push(currentCorner);
        if (addToStack.length > 1) {
          // visit the ones with smallest theta first
          var previousCorner = next.previousCorners[next.previousCorners.length - 1];
          addToStack.sort(function (a, b) {
            return (calculateTheta(previousCorner, currentCorner, b) -
              calculateTheta(previousCorner, currentCorner, a));
          });
        }

        if (addToStack.length > 0) {
          // add to the stack
          Utils.forEach(addToStack, function (corner) {
            stack.push({
              corner: corner,
              previousCorners: previousCorners
            });
          });
        }

        // pop off the next one
        next = stack.pop();
      }
      return [];
    }

    // find tightest loops, for each corner, for each adjacent
    // TODO: optimize this, only check corners with > 2 adjacents, or isolated cycles
    var loops = [];
    for (var i = 0; i < corners.length; i++) {
      var firstCorner = corners[i];
      var adjacentCorners = firstCorner.adjacentCorners();
      for (var j = 0; j < adjacentCorners.length; j++) {
        var secondCorner = adjacentCorners[j];
        loops.push(findTightestCycle(firstCorner, secondCorner));
      }
    }
    // remove duplicates
    var uniqueLoops = removeDuplicateRooms(loops);
    //remove CW loops
    var uniqueCCWLoops = Utils.removeIf(uniqueLoops, Utils.isClockwise);

    //Utils.forEach(uniqueCCWLoops, function(loop) {
    //  console.log("LOOP");
    //  Utils.forEach(loop, function(corner) {
    //    console.log(corner.id);
    //  });
    //});
    return uniqueCCWLoops;
  }
}
