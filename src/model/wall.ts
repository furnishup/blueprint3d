/// <reference path="../../lib/three.d.ts" />
/// <reference path="../../lib/jQuery.d.ts" />
/// <reference path="../core/configuration.ts" />
/// <reference path="../core/utils.ts" />
/// <reference path="../items/item.ts" />
/// <reference path="corner.ts" />
/// <reference path="half_edge.ts" />

module BP3D.Model {
  /** The default wall texture. */
  const defaultWallTexture = {
    url: "rooms/textures/wallmap.png",
    stretch: true,
    scale: 0
  }

  /** 
   * A Wall is the basic element to create Rooms.
   * 
   * Walls consists of two half edges.
   */
  export class Wall {

    /** The unique id of each wall. */
    private id: string;

    /** Front is the plane from start to end. */
    public frontEdge: HalfEdge = null;

    /** Back is the plane from end to start. */
    public backEdge: HalfEdge = null;

    /** */
    public orphan = false;

    /** Items attached to this wall */
    public items: Items.Item[] = [];

    /** */
    public onItems: Items.Item[] = [];

    /** The front-side texture. */
    public frontTexture = defaultWallTexture;

    /** The back-side texture. */
    public backTexture = defaultWallTexture;

    /** Wall thickness. */
    public thickness = Core.Configuration.getNumericValue(Core.configWallThickness);

    /** Wall height. */
    public height = Core.Configuration.getNumericValue(Core.configWallHeight);

    /** Actions to be applied after movement. */
    private moved_callbacks = $.Callbacks();

    /** Actions to be applied on removal. */
    private deleted_callbacks = $.Callbacks();

    /** Actions to be applied explicitly. */
    private action_callbacks = $.Callbacks();

    /** 
     * Constructs a new wall.
     * @param start Start corner.
     * @param end End corner.
     */
    constructor(private start: Corner, private end: Corner) {
      this.id = this.getUuid();

      this.start.attachStart(this)
      this.end.attachEnd(this);
    }

    private getUuid(): string {
      return [this.start.id, this.end.id].join();
    }

    public resetFrontBack() {
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

    private relativeMove(dx: number, dy: number) {
      this.start.relativeMove(dx, dy);
      this.end.relativeMove(dx, dy);
    }

    public fireMoved() {
      this.moved_callbacks.fire();
    }

    public fireRedraw() {
      if (this.frontEdge) {
        this.frontEdge.redrawCallbacks.fire();
      }
      if (this.backEdge) {
        this.backEdge.redrawCallbacks.fire();
      }
    }

    public getStart(): Corner {
      return this.start;
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

    public remove() {
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

    public distanceFrom(x: number, y: number): number {
      return Core.Utils.pointDistanceFromLine(x, y,
        this.getStartX(), this.getStartY(),
        this.getEndX(), this.getEndY());
    }

    /** Return the corner opposite of the one provided.
     * @param corner The given corner.
     * @returns The opposite corner.
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
