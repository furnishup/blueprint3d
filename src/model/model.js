var JQUERY = require('jquery');
var THREE = require('three')

var Floorplan = require('./floorplan');
var Scene = require('./scene');

var utils = require('../utils/utils')

var Model = function(textureDir) {
  var scope = this;

  this.floorplan = new Floorplan();
  this.scene = new Scene(scope, textureDir);

  this.roomName = "";
  this.roomId = 0;
  this.roomCode = "";

  this.roomLoadingCallbacks = JQUERY.Callbacks();
  this.roomLoadedCallbacks = JQUERY.Callbacks(); // name
  this.roomSavedCallbacks = JQUERY.Callbacks(); // success (bool), copy (bool)
  this.roomDeletedCallbacks = JQUERY.Callbacks();

  this.loadSerialized = function(data) {
    // TODO: better documentation on serialization format
    var saveCopy = saveCopy || false;
    this.roomLoadingCallbacks.fire();

    scope.newRoom(
      JSON.parse(data.floorplan),
      data.room_items
    );

    scope.roomName = data.name;
    scope.roomCode = data.code;
    scope.roomId = data.id;

    scope.roomLoadedCallbacks.fire(data.name);
  }

  this.exportSerialized = function() {

    var room_item_attributes = [];
    var objects = scope.scene.getItems();
    for ( var i = 0; i < objects.length; i++ ) {
      var object = objects[i];
      room_item_attributes[i] = {
        item_configuration_id: object.metadata.itemId,
        xpos: object.position.x,
        ypos: object.position.y,
        zpos: object.position.z,
        rotation: object.rotation.y,
        scale_x: object.scale.x,
        scale_y: object.scale.y,
        scale_z: object.scale.z,
        fixed: object.fixed
      };
    }

    var room = {
      name: scope.roomName,
      floorplan: JSON.stringify(scope.floorplan.saveFloorplan()),
      room_items_attributes: room_item_attributes
    };

    return room;
  }

  this.newRoom = function(floorplan, items) {
    this.scene.clearItems();
    this.floorplan.loadFloorplan(floorplan);
    utils.forEach(items, function(item) {
      position = new THREE.Vector3(
        item.xpos, item.ypos, item.zpos)    
      var metadata = {
        itemId: item.item_configuration_id,
        price: item.price,
        manufacturer: item.manufacturer,
        itemName: item.item_name,
        resizable: item.resizable
      }
      var scale = {
        x: item.scale_x,
        y: item.scale_y,
        z: item.scale_z
      }
      scope.scene.addItem( 
        item.item_type, 
        item.model_url, 
        metadata,
        position, 
        item.rotation,
        scale,
        item.fixed);
    });
  }
}

module.exports = Model;
