/// <reference path="../../lib/three.d.ts" />
/// <reference path="../utils/utils.ts" />
/// <reference path="floor.ts" />
/// <reference path="edge.ts" />

module BP3D.Three {
  export var Floorplan = function (scene, floorplan, controls) {

    var scope = this;

    this.scene = scene;
    this.floorplan = floorplan;
    this.controls = controls;

    this.floors = [];
    this.edges = [];

    floorplan.fireOnUpdatedRooms(redraw);

    function redraw() {
      // clear scene
      Utils.forEach(scope.floors, function (floor) {
        floor.removeFromScene();
      });
      Utils.forEach(scope.edges, function (edge) {
        edge.remove();
      });
      scope.floors = [];
      scope.edges = [];

      // draw floors
      Utils.forEach(scope.floorplan.getRooms(), function (room) {
        var threeFloor = new Three.Floor(scene, room);
        scope.floors.push(threeFloor);
        threeFloor.addToScene();
      });

      // draw edges
      Utils.forEach(scope.floorplan.wallEdges(), function (edge) {
        var threeEdge = new Three.Edge(
          scene, edge, scope.controls);
        scope.edges.push(threeEdge);
      });
    }

  }
}
