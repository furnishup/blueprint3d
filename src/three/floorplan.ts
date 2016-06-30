/// <reference path="../../lib/three.d.ts" />
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
      scope.floors.forEach((floor) => {
        floor.removeFromScene();
      });

      scope.edges.forEach((edge) => {
        edge.remove();
      });
      scope.floors = [];
      scope.edges = [];

      // draw floors
     scope.floorplan.getRooms().forEach((room) => {
        var threeFloor = new Three.Floor(scene, room);
        scope.floors.push(threeFloor);
        threeFloor.addToScene();
      });

      // draw edges
      scope.floorplan.wallEdges().forEach((edge) => {
        var threeEdge = new Three.Edge(
          scene, edge, scope.controls);
        scope.edges.push(threeEdge);
      });
    }
  }
}
