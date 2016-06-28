/// <reference path="../../lib/three.d.ts" />
/// <reference path="../../lib/jQuery.d.ts" />
/// <reference path="../utils/utils.ts" />
/// <reference path="corner.ts" />
/// <reference path="half_edge.ts" />

module BP3D.Model {
  /** */
  const defaultTexture = {
    url: "rooms/textures/wallmap.png",
    stretch: true,
    scale: 0
  }

  /**  */
  export class Wall {

    /** */
    private id: string;

    /** Front is the plane from start to end */
    public frontEdge: HalfEdge = null;

    /** */
    public backEdge: HalfEdge = null;

    /** */
    private orphan = false;

    /** Items attached to this wall */
    private items = [];

    /** */
    private onItems = [];

    /** */
    public frontTexture = defaultTexture;

    /** */
    public backTexture = defaultTexture;

    /** */
    public thickness = 10;

    /** */
    public height = 250;

    /** */
    private moved_callbacks: JQueryCallback;

    /** */
    private deleted_callbacks: JQueryCallback;

    /** */
    private action_callbacks: JQueryCallback;

    /** */
    constructor(private start: Corner, private end: Corner) {
      this.id = this.getUuid();

      this.moved_callbacks = $.Callbacks();
      this.deleted_callbacks = $.Callbacks();
      this.action_callbacks = $.Callbacks();

      this.start.attachStart(this)
      this.end.attachEnd(this);
    }

    private getUuid() {
      return [this.start.id, this.end.id].join();
    }

    private resetFrontBack(func) {
      this.frontEdge = null;
      this.backEdge = null;
      this.orphan = false;
    }

    private snapToAxis(tolerance: number) {
      // order here is important, but unfortunately arbitrary
      this.start.snapToAxis(tolerance);
      this.end.snapToAxis(tolerance);
    }

    public fireOnMove(func) {
      this.moved_callbacks.add(func);
    }

    public fireOnDelete(func) {
      this.deleted_callbacks.add(func);
    }

    public dontFireOnDelete(func) {
      this.deleted_callbacks.remove(func);
    }

    public fireOnAction(func) {
      this.action_callbacks.add(func)
    }

    public fireAction(action) {
      this.action_callbacks.fire(action)
    }

    public getStart(): Corner {
      return this.start;
    }

    private relativeMove(dx: number, dy: number) {
      this.start.relativeMove(dx, dy);
      this.end.relativeMove(dx, dy);
    }

    public fireMoved() {
      this.moved_callbacks.fire();
    }

    public fireRedrawpublic() {
      if (this.frontEdge) {
        this.frontEdge.redrawCallbacks.fire();
      }
      if (this.backEdge) {
        this.backEdge.redrawCallbacks.fire();
      }
    }

    public getEnd(): Corner {
      return this.end;
    }

    public getStartX(): number {
      return this.start.getX();
    }

    public getEndX(): number {
      return this.end.getX();
    }

    public getStartY(): number {
      return this.start.getY();
    }

    public getEndY(): number {
      return this.end.getY();
    }

    private remove() {
      this.start.detachWall(this);
      this.end.detachWall(this);
      this.deleted_callbacks.fire(this);
    }

    public setStart(corner: Corner) {
      this.start.detachWall(this);
      corner.attachStart(this);
      this.start = corner;
      this.fireMoved();
    }

    public setEnd(corner: Corner) {
      this.end.detachWall(this);
      corner.attachEnd(this);
      this.end = corner;
      this.fireMoved();
    }

    private distanceFrom(x: number, y: number): number {
      return Utils.pointDistanceFromLine(x, y,
        this.getStartX(), this.getStartY(),
        this.getEndX(), this.getEndY());
    }

    /** 
     * return the corner opposite of the one provided
     */
    private oppositeCorner(corner: Corner): Corner {
      if (this.start === corner) {
        return this.end;
      } else if (this.end === corner) {
        return this.start;
      } else {
        console.log('Wall does not connect to corner');
      }
    }
  }
}
