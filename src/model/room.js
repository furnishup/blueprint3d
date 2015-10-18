var JQUERY = require('jquery');
var THREE = require('three')

var utils = require('../utils/utils')

/*
TODO
var Vec2 = require('vec2')
var segseg = require('segseg')
var Polygon = require('polygon')
*/

var HalfEdge = require('./half_edge')

var Room = function(floorplan, corners) {
 
  var scope = this;

  // ordered CCW
  var floorplan = floorplan;
  this.corners = corners;

  this.interiorCorners = [];
  this.edgePointer = null;
  
  // floor plane for intersection testing
  this.floorPlane = null;

  this.customTexture = false;

  var defaultTexture = {
    url: "rooms/textures/hardwood.png",
    scale: 400
  }

  var floorChangeCallbacks = JQUERY.Callbacks();

  updateWalls();
  updateInteriorCorners();
  generatePlane();

  this.getUuid = function() {
    var cornerUuids = utils.map(this.corners, function(c) {
      return c.id;
    });
    cornerUuids.sort();
    return cornerUuids.join();
  }

  this.fireOnFloorChange = function(callback) {
    floorChangeCallbacks.add(callback);
  }

  this.getTexture = function() {
    var uuid = this.getUuid();
    var tex = floorplan.getFloorTexture(uuid);
    return tex || defaultTexture;
  }

  // textureStretch always true, just an argument for consistency with walls
  this.setTexture = function(textureUrl, textureStretch, textureScale) {
    var uuid = this.getUuid();
    floorplan.setFloorTexture(uuid, textureUrl, textureScale);
    floorChangeCallbacks.fire();
  }

  function generatePlane() {
    var points = [];
    utils.forEach( scope.interiorCorners, function(corner) {
        points.push(new THREE.Vector2(
          corner.x, 
          corner.y));
    });
    var shape = new THREE.Shape(points);
    var geometry = new THREE.ShapeGeometry(shape);
    scope.floorPlane = new THREE.Mesh(geometry,
      new THREE.MeshBasicMaterial({
        side: THREE.DoubleSide
      }));
    scope.floorPlane.visible = false;
    scope.floorPlane.rotation.set(Math.PI/2, 0, 0);
    scope.floorPlane.room = scope; // js monkey patch
  }

  function cycleIndex(ind) {
    if (ind < 0) {
      return ind += scope.corners.length;
    } else {
      return ind % scope.corners.length;
    }
  }

  function updateInteriorCorners() {
    var edge = scope.edgePointer;
    while (true) {
      scope.interiorCorners.push(edge.interiorStart());
      edge.generatePlane();
      if (edge.next === scope.edgePointer) {
        break;
      } else {
        edge = edge.next;
      }
    }
  }

  // populates each wall's half edge relating to this room
  // this creates a fancy doubly connected edge list (DCEL)
  function updateWalls() {

    var prevEdge = null;
    var firstEdge = null;

    for (i = 0; i < corners.length; i++) {

      var firstCorner = corners[i];
      var secondCorner = corners[(i + 1) % corners.length];

      // find if wall is heading in that direction
      var wallTo = firstCorner.wallTo(secondCorner);
      var wallFrom = firstCorner.wallFrom(secondCorner);

      if (wallTo) {
        var edge = new HalfEdge(scope, wallTo, true);
      } else if (wallFrom) {
        var edge = new HalfEdge(scope, wallFrom, false);
      } else {
        // something horrible has happened
        console.log("corners arent connected by a wall, uh oh");
      }

      if (i == 0) {
        firstEdge = edge;
      }  else {
        edge.prev = prevEdge;
        prevEdge.next = edge;
        if (i + 1 == corners.length) {
          firstEdge.prev = edge;
          edge.next = firstEdge;
        }
      }
      prevEdge = edge;
    }

    // hold on to an edge reference
    scope.edgePointer = firstEdge;
  }

}

module.exports = Room;
