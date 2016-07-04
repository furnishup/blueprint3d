var JQUERY = require('jquery');

var utils = require('../utils/utils')

// x and y are floats
var Corner = function(floorplan, x, y, id) {

  this.id = id || utils.guid();

  var scope = this;

  this.x = x;
  this.y = y;

  var floorplan = floorplan;

  var tolerance = 20;

  this.wallStarts = []
  this.wallEnds = []

  var moved_callbacks = JQUERY.Callbacks();
  var deleted_callbacks = JQUERY.Callbacks();
  var action_callbacks = JQUERY.Callbacks();

  this.fireOnMove = function(func) {
    moved_callbacks.add(func);
  }

  this.fireOnDelete = function(func) {
    deleted_callbacks.add(func);
  }

  this.fireOnAction = function(func) {
    action_callbacks.add(func);
  }

  // TODO: deprecate
  this.getX = function() {
    return this.x;
  }

  // TODO: deprecate
  this.getY = function() {
    return this.y;
  }

  this.snapToAxis = function(tolerance) {
    // try to snap this corner to an axis
    var snapped = {
      x: false,
      y: false
    };
    utils.forEach(this.adjacentCorners(), function(corner) {
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

  this.relativeMove = function(dx, dy) {
    this.move(this.x + dx, this.y + dy);
  }

  this.fireAction = function(action) {
    action_callbacks.fire(action)
  }

  this.remove = function() {
    deleted_callbacks.fire(this);
  }

  this.removeAll = function() {
    for( var i = 0; i < this.wallStarts.length; i++ ) {
      this.wallStarts[i].remove();
    }
    for( var i = 0; i < this.wallEnds.length; i++ ) {
      this.wallEnds[i].remove();  
    } 
    this.remove()
  }

  this.move = function(newX, newY) {
    this.x = newX;
    this.y = newY;
    this.mergeWithIntersected();
    moved_callbacks.fire(this.x, this.y);
    utils.forEach(this.wallStarts, function(wall) {
      wall.fireMoved();
    });
    utils.forEach(this.wallEnds, function(wall) {
      wall.fireMoved();
    });
  }

  this.adjacentCorners = function() {
    retArray = [];
    for( var i = 0; i < this.wallStarts.length; i++ ) {
      retArray.push(this.wallStarts[i].getEnd());
    }
    for( var i = 0; i < this.wallEnds.length; i++ ) {
      retArray.push(this.wallEnds[i].getStart());
    }
    return retArray;   
  }

  this.isWallConnected = function(wall) {
    for( var i = 0; i < this.wallStarts.length; i++ ) {
      if (this.wallStarts[i] == wall) {
        return true;
      }
    }
    for( var i = 0; i < this.wallEnds.length; i++ ) {
      if (this.wallEnds[i] == wall) {
        return true;
      }
    }  
    return false;      
  }

  this.distanceFrom = function(x, y) {
    var distance = utils.distance(x, y, this.x, this.y);
    //console.log('x,y ' + x + ',' + y + ' to ' + this.getX() + ',' + this.getY() + ' is ' + distance);
    return distance;
  }

  this.distanceFromWall = function(wall) {
    return wall.distanceFrom(this.x, this.y);
  }

  this.distanceFromCorner = function(corner) {
    return this.distanceFrom(corner.x, corner.y);
  }

  this.detachWall = function(wall) {
    utils.removeValue(this.wallStarts, wall);
    utils.removeValue(this.wallEnds, wall);
    if (this.wallStarts.length == 0 && this.wallEnds.length == 0) {    
      this.remove();
    }     
  }

  this.attachStart = function(wall) {
    this.wallStarts.push(wall)
  }

  this.attachEnd = function(wall) {
    this.wallEnds.push(wall)
  }

  // get wall to corner
  this.wallTo = function(corner) {
    for( var i = 0; i < this.wallStarts.length; i++ ) {
      if (this.wallStarts[i].getEnd() === corner) {
        return this.wallStarts[i];
      }
    }
    return null; 
  }

  this.wallFrom = function(corner) {
    for( var i = 0; i < this.wallEnds.length; i++ ) {
      if (this.wallEnds[i].getStart() === corner) {
        return this.wallEnds[i];
      }
    } 
    return null;
  }

  this.wallToOrFrom = function(corner) {
    return this.wallTo(corner) || this.wallFrom(corner);
  }

  this.combineWithCorner = function(corner) {
    // update position to other corner's
    this.x = corner.x;
    this.y = corner.y;
    // absorb the other corner's wallStarts and wallEnds
    for( var i = corner.wallStarts.length - 1; i >= 0; i-- ) {
      corner.wallStarts[i].setStart( this );
    }
    for( var i = corner.wallEnds.length - 1; i >= 0; i-- ) {
      corner.wallEnds[i].setEnd( this );         
    }           
    // delete the other corner
    corner.removeAll();
    this.removeDuplicateWalls();
    floorplan.update();
  }

  this.mergeWithIntersected = function() {
    //console.log('mergeWithIntersected for object: ' + this.type);
    // check corners
    for( var i = 0; i < floorplan.getCorners().length; i++ ) {
      obj = floorplan.getCorners()[i];
      if (this.distanceFromCorner(obj) < tolerance && obj != this) {
        this.combineWithCorner(obj);
        return true;
      }
    }
    // check walls
    for( var i = 0; i < floorplan.getWalls().length; i++ ) {
      obj = floorplan.getWalls()[i];
      if (this.distanceFromWall(obj) < tolerance && !this.isWallConnected( obj )) {
        // update position to be on wall
        var intersection = utils.closestPointOnLine(this.x, this.y, 
          obj.getStart().x, obj.getStart().y, 
          obj.getEnd().x, obj.getEnd().y);
        this.x = intersection.x;
        this.y = intersection.y;
        // merge this corner into wall by breaking wall into two parts
        floorplan.newWall(   
          this, obj.getEnd());
        obj.setEnd(this); 
        floorplan.update();
        return true;
      }         
    }
    return false;
  }

  // ensure we do not have duplicate walls (i.e. same start and end points)
  this.removeDuplicateWalls = function() {
    // delete the wall between these corners, if it exists
    var wallEndpoints = {};
    var wallStartpoints = {};
    for( var i = this.wallStarts.length - 1; i >= 0; i-- ) {
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
    for( var i = this.wallEnds.length - 1; i >= 0; i-- ) {
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

};

module.exports = Corner;
