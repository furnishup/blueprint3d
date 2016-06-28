/// <reference path="../../lib/jQuery.d.ts" />
/// <reference path="../utils/utils.ts" />

module BP3D.Model {

  const tolerance: number = 20;

  /** Corners are used to define walls. */
  export class Corner {

    /** */
    private wallStarts: any[];

    /** */
    private wallEnds: any[];

    /** */
    private moved_callbacks: JQueryCallback;

    /** */
    private deleted_callbacks: JQueryCallback;

    /** */
    private action_callbacks: JQueryCallback;

    /** Constructs a corner. 
     * @param floorplan The associated floorplan.
     * @param x X coordinate.
     * @param y Y coordinate.
    */
    constructor(private floorplan: any, private x: number, private y: number, private id?: string) {
      this.id = id || Utils.guid();

      this.wallStarts = []
      this.wallEnds = []

      this.moved_callbacks = $.Callbacks();
      this.deleted_callbacks = $.Callbacks();
      this.action_callbacks = $.Callbacks();
    }

    /**
     * 
     */
    public fireOnMove(func) {
      this.moved_callbacks.add(func);
    }

    /**
     * 
     */
    public fireOnDelete(func) {
      this.deleted_callbacks.add(func);
    }

    /**
     * 
     */
    public fireOnAction(func) {
      this.action_callbacks.add(func);
    }

    /**
     * @returns
     * @deprecated
     */
    public getX(): number {
      return this.x;
    }

    /**
     * @returns
     * @deprecated
     */
    public getY(): number {
      return this.y;
    }

    /**
     * 
     */
    public snapToAxis(tolerance: number): { x: boolean, y: boolean } {
      // try to snap this corner to an axis
      var snapped = {
        x: false,
        y: false
      };

      var scope = this;

      Utils.forEach(this.adjacentCorners(), function (corner: Corner) {
        if (Math.abs(corner.x - scope.x) < tolerance) {
          scope.x = corner.x;
          snapped.x = true;
        }
        if (Math.abs(corner.y - scope.y) < tolerance) {
          scope.y = corner.y;
          snapped.y = true;
        }
      });
      return snapped;
    }

    private relativeMove(dx: number, dy: number) {
      this.move(this.x + dx, this.y + dy);
    }

    private fireAction(action) {
      this.action_callbacks.fire(action)
    }

    private remove() {
      this.deleted_callbacks.fire(this);
    }

    private removeAll() {
      for (var i = 0; i < this.wallStarts.length; i++) {
        this.wallStarts[i].remove();
      }
      for (var i = 0; i < this.wallEnds.length; i++) {
        this.wallEnds[i].remove();
      }
      this.remove()
    }

    /**
     * 
     */
    private move(newX: number, newY: number) {
      this.x = newX;
      this.y = newY;
      this.mergeWithIntersected();
      this.moved_callbacks.fire(this.x, this.y);
      Utils.forEach(this.wallStarts, function (wall) {
        wall.fireMoved();
      });
      Utils.forEach(this.wallEnds, function (wall) {
        wall.fireMoved();
      });
    }

    /**
     * 
     */
    private adjacentCorners() {
      var retArray = [];
      for (var i = 0; i < this.wallStarts.length; i++) {
        retArray.push(this.wallStarts[i].getEnd());
      }
      for (var i = 0; i < this.wallEnds.length; i++) {
        retArray.push(this.wallEnds[i].getStart());
      }
      return retArray;
    }

    /**
     * 
     */
    private isWallConnected(wall): boolean {
      for (var i = 0; i < this.wallStarts.length; i++) {
        if (this.wallStarts[i] == wall) {
          return true;
        }
      }
      for (var i = 0; i < this.wallEnds.length; i++) {
        if (this.wallEnds[i] == wall) {
          return true;
        }
      }
      return false;
    }

    /**
     * 
     */
    public distanceFrom(x: number, y: number): number {
      var distance = Utils.distance(x, y, this.x, this.y);
      //console.log('x,y ' + x + ',' + y + ' to ' + this.getX() + ',' + this.getY() + ' is ' + distance);
      return distance;
    }

    /**
     * 
     */
    public distanceFromWall(wall): number {
      return wall.distanceFrom(this.x, this.y);
    }

    /**
     * 
     */
    public distanceFromCorner(corner): number {
      return this.distanceFrom(corner.x, corner.y);
    }

    /**
     * 
     */
    private detachWall(wall) {
      Utils.removeValue(this.wallStarts, wall);
      Utils.removeValue(this.wallEnds, wall);
      if (this.wallStarts.length == 0 && this.wallEnds.length == 0) {
        this.remove();
      }
    }

    /**
     * 
     */
    private attachStart(wall) {
      this.wallStarts.push(wall)
    }

    /**
     * 
     */
    private attachEnd(wall) {
      this.wallEnds.push(wall)
    }

    /** 
     * Get wall to corner.
     */
    public wallTo(corner: Corner) {
      for (var i = 0; i < this.wallStarts.length; i++) {
        if (this.wallStarts[i].getEnd() === corner) {
          return this.wallStarts[i];
        }
      }
      return null;
    }

    /**
     * 
     */
    public wallFrom(corner: Corner) {
      for (var i = 0; i < this.wallEnds.length; i++) {
        if (this.wallEnds[i].getStart() === corner) {
          return this.wallEnds[i];
        }
      }
      return null;
    }

    /**
     * 
     */
    public wallToOrFrom(corner: Corner) {
      return this.wallTo(corner) || this.wallFrom(corner);
    }

    /**
     * 
     */
    private combineWithCorner(corner: Corner) {
      // update position to other corner's
      this.x = corner.x;
      this.y = corner.y;
      // absorb the other corner's wallStarts and wallEnds
      for (var i = corner.wallStarts.length - 1; i >= 0; i--) {
        corner.wallStarts[i].setStart(this);
      }
      for (var i = corner.wallEnds.length - 1; i >= 0; i--) {
        corner.wallEnds[i].setEnd(this);
      }
      // delete the other corner
      corner.removeAll();
      this.removeDuplicateWalls();
      this.floorplan.update();
    }

    private mergeWithIntersected(): boolean {
      //console.log('mergeWithIntersected for object: ' + this.type);
      // check corners
      for (var i = 0; i < this.floorplan.getCorners().length; i++) {
        var obj = this.floorplan.getCorners()[i];
        if (this.distanceFromCorner(obj) < tolerance && obj != this) {
          this.combineWithCorner(obj);
          return true;
        }
      }
      // check walls
      for (var i = 0; i < this.floorplan.getWalls().length; i++) {
        obj = this.floorplan.getWalls()[i];
        if (this.distanceFromWall(obj) < tolerance && !this.isWallConnected(obj)) {
          // update position to be on wall
          var intersection = Utils.closestPointOnLine(this.x, this.y,
            obj.getStart().x, obj.getStart().y,
            obj.getEnd().x, obj.getEnd().y);
          this.x = intersection.x;
          this.y = intersection.y;
          // merge this corner into wall by breaking wall into two parts
          this.floorplan.newWall(
            this, obj.getEnd());
          obj.setEnd(this);
          this.floorplan.update();
          return true;
        }
      }
      return false;
    }

    // ensure we do not have duplicate walls (i.e. same start and end points)
    private removeDuplicateWalls() {
      // delete the wall between these corners, if it exists
      var wallEndpoints = {};
      var wallStartpoints = {};
      for (var i = this.wallStarts.length - 1; i >= 0; i--) {
        if (this.wallStarts[i].getEnd() === this) {
          // remove zero length wall 
          this.wallStarts[i].remove();
        } else if (this.wallStarts[i].getEnd().id in wallEndpoints) {
          // remove duplicated wall
          this.wallStarts[i].remove();
        } else {
          wallEndpoints[this.wallStarts[i].getEnd().id] = true;
        }
      }
      for (var i = this.wallEnds.length - 1; i >= 0; i--) {
        if (this.wallEnds[i].getStart() === this) {
          // removed zero length wall 
          this.wallEnds[i].remove();
        } else if (this.wallEnds[i].getStart().id in wallStartpoints) {
          // removed duplicated wall
          this.wallEnds[i].remove();
        } else {
          wallStartpoints[this.wallEnds[i].getStart().id] = true;
        }
      }
    }
  }
}
