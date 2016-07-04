var THREE = require('three')
var ThreeFloor = require('./three_floor');
var ThreeEdge = require('./three_edge');
var utils = require('../utils/utils')

// THREE.Scene, Blueprint.Floorplan
ThreeFloorplan = function(scene, floorplan, controls) {

  var scope = this;

  this.scene = scene;
  this.floorplan = floorplan;
  this.controls = controls;

  this.floors = [];
  this.edges = [];

  floorplan.fireOnUpdatedRooms(redraw);

  function redraw() {
    // clear scene
    utils.forEach(scope.floors, function(floor) {
      floor.removeFromScene();
    });
    utils.forEach(scope.edges, function(edge) {
      edge.remove();
    });
    scope.floors = [];
    scope.edges = [];

    // draw floors
    utils.forEach(scope.floorplan.getRooms(), function(room) {
      var threeFloor = new ThreeFloor(scene, room);
      scope.floors.push(threeFloor);
      threeFloor.addToScene();
    });

    // draw edges
    utils.forEach(scope.floorplan.wallEdges(), function(edge) {
      var threeEdge = new ThreeEdge(
        scene, edge, scope.controls);
      scope.edges.push(threeEdge);
    });
  }

}

module.exports = ThreeFloorplan;
