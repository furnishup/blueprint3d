var THREE = require('three');

var Item = require('./item');

var utils = require('../utils/utils')


var FloorItem = function(three, metadata, geometry, material, position, rotation, scale) {
    Item.call(this, three, metadata, geometry, material, position, rotation, scale);
};

FloorItem.prototype = Object.create(Item.prototype);

FloorItem.prototype.placeInRoom = function() {
    if (!this.position_set) {
        var center = this.model.floorplan.getCenter();
        this.position.x = center.x;
        this.position.z = center.z;
        this.position.y = 0.5 * ( this.geometry.boundingBox.max.y - this.geometry.boundingBox.min.y );        
    }
};

FloorItem.prototype.resized = function() {
    // take action after a resize
    this.position.y = this.halfSize.y;
}

FloorItem.prototype.moveToPosition = function(vec3, intersection) {
    // keeps the position in the room and on the floor
    if (!this.isValidPosition(vec3)) {
        this.showError(vec3);
        return;
    } else {
        this.hideError();
        vec3.y = this.position.y; // keep it on the floor!
        this.position.copy(vec3);
    }
}


FloorItem.prototype.isValidPosition = function(vec3) {
    var corners = this.getCorners('x', 'z', vec3);

    // check if we are in a room
    var rooms = this.model.floorplan.getRooms();
    var isInARoom = false;
    for (var i = 0; i < rooms.length; i++) {
        if(utils.pointInPolygon(vec3.x, vec3.z, rooms[i].interiorCorners) &&
            !utils.polygonPolygonIntersect(corners, rooms[i].interiorCorners)) {
            isInARoom = true;
        }
    }
    if (!isInARoom) {
        //console.log('object not in a room');
        return false;
    }

    // check if we are outside all other objects
    /*
    if (this.obstructFloorMoves) {
        var objects = this.model.items.getItems();
        for (var i = 0; i < objects.length; i++) {
            if (objects[i] === this || !objects[i].obstructFloorMoves) {
                continue;
            }
            if (!utils.polygonOutsidePolygon(corners, objects[i].getCorners('x', 'z')) ||
                utils.polygonPolygonIntersect(corners, objects[i].getCorners('x', 'z'))) {
                //console.log('object not outside other objects');
                return false;
            }
        }
    }*/

    return true;
}

module.exports = FloorItem;