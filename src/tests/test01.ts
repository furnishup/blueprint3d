/// <reference path="../../lib/jQuery.d.ts" />
/// <reference path="../model/corner.ts" />
/// <reference path="../model/floorplan.ts" />
/// <reference path="../model/wall.ts" />
/// <reference path="../utils/utils.ts" />

// TODO Tests should be removed sooner or later, and put into separate package.

module BP3D.Tests {
  /**
   * Test 01: Basic functionality. This is WiP...
   */
  export class Test01 {
    /** Constructs an initial room from a few walls. */
    constructor() {
      var tFloorplan = new Model.Floorplan();

      var tCorner1 = new Model.Corner(tFloorplan, 0, 0);
      var tCorner2 = new Model.Corner(tFloorplan, 10, 0);
      var tCorner3 = new Model.Corner(tFloorplan, 10, 10);

      var tWall1 = new Model.Wall(tCorner1, tCorner2);
      var tWall2 = new Model.Wall(tCorner2, tCorner3);
    }
  }
}