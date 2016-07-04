var JQUERY = require('jquery');
var utils = require('../utils/utils')

// start and end are Corner objects
var Wall = function(start, end) {

  this.id = getUuid();

  var scope = this;
  
  var start = start;
  var end = end;

  this.thickness = 10;
  this.height = 250;

  // front is the plane from start to end
  // these are of type HalfEdge
  this.frontEdge = null;
  this.backEdge = null;
  this.orphan = false;

  // items attached to this wall
  this.items = [];
  this.onItems = [];

  var moved_callbacks = JQUERY.Callbacks();
  var deleted_callbacks = JQUERY.Callbacks();
  var action_callbacks = JQUERY.Callbacks();

  var defaultTexture =  {
    url: "rooms/textures/wallmap.png",
    stretch: true,
    scale: 0
  }
  this.frontTexture = defaultTexture;
  this.backTexture = defaultTexture;

  start.attachStart(this)
  end.attachEnd(this);

  function getUuid() {
    return [start.id, end.id].join();
  }

  this.resetFrontBack = function(func) {
    this.frontEdge = null;
    this.backEdge = null; 
    this.orphan = false;
  }

  this.snapToAxis = function(tolerance) {
    // order here is important, but unfortunately arbitrary
    start.snapToAxis(tolerance);
    end.snapToAxis(tolerance);
  }

  this.fireOnMove = function(func) {
    moved_callbacks.add(func);
  }

  this.fireOnDelete = function(func) {
    deleted_callbacks.add(func);
  }

  this.dontFireOnDelete = function(func) {
    deleted_callbacks.remove(func);
  }

  this.fireOnAction = function(func) {
    action_callbacks.add(func)
  }

  this.fireAction = function(action) {
    action_callbacks.fire(action)
  }

  this.getStart = function() {
    return start;
  }

  this.relativeMove = function(dx, dy) {
    start.relativeMove(dx, dy);
    end.relativeMove(dx, dy);
  }

  this.fireMoved = function() {
    moved_callbacks.fire();
  }

  this.fireRedraw = function() {
    if (scope.frontEdge) {
      scope.frontEdge.redrawCallbacks.fire();
    }
    if (scope.backEdge) {
      scope.backEdge.redrawCallbacks.fire();
    }
  }

  this.getEnd = function() {
    return end;
  }

  this.getStartX = function() {
    return start.getX();
  }

  this.getEndX = function() {
    return end.getX();
  }

  this.getStartY = function() {
    return start.getY();
  }

  this.getEndY = function() {
    return end.getY();
  }

  this.remove = function() {
    start.detachWall(this);
    end.detachWall(this);
    deleted_callbacks.fire(this);
  }

  this.setStart = function(corner) {
    start.detachWall(this);
    corner.attachStart(this);
    start = corner;
    this.fireMoved();
  }

  this.setEnd = function(corner) {
    end.detachWall(this);
    corner.attachEnd(this);
    end = corner;
    this.fireMoved();
  }

  this.distanceFrom = function(x, y) {
    return utils.pointDistanceFromLine(x, y, 
      this.getStartX(), this.getStartY(), 
      this.getEndX(), this.getEndY());
  }

  // return the corner opposite of the one provided
  this.oppositeCorner = function( corner ) {
    if ( start === corner ) {
      return end;
    } else if ( end === corner ) {
      return start;
    } else {
      console.log('Wall does not connect to corner');
    }
  }

}

module.exports = Wall;
