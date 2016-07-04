var JQUERY = require('jquery');
var THREE = require('three')

var Floorplan = require('./floorplan');
var Scene = require('./scene');

var utils = require('../utils/utils')

var Model = function(textureDir) {
  var scope = this;

  this.floorplan = new Floorplan();
  this.scene = new Scene(scope, textureDir);

  this.roomLoadingCallbacks = JQUERY.Callbacks();
  this.roomLoadedCallbacks = JQUERY.Callbacks(); // name
  this.roomSavedCallbacks = JQUERY.Callbacks(); // success (bool), copy (bool)
  this.roomDeletedCallbacks = JQUERY.Callbacks();

  this.loadSerialized = function(data_json) {
    // TODO: better documentation on serialization format.
    // TODO: a much better serialization format.
    this.roomLoadingCallbacks.fire();

    data = JSON.parse(data_json)
    scope.newRoom(
      data.floorplan,
      data.items
    );

    scope.roomLoadedCallbacks.fire();
  }

  this.exportSerialized = function() {
    var items_arr = [];
    var objects = scope.scene.getItems();
    for ( var i = 0; i < objects.length; i++ ) {
      var object = objects[i];
      items_arr[i] = {
        item_name: object.metadata.itemName,
        item_type: object.metadata.itemType,
        model_url: object.metadata.modelUrl,
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
      floorplan: (scope.floorplan.saveFloorplan()),
      items: items_arr
    };

    return JSON.stringify(room);
  }

  this.newRoom = function(floorplan, items) {
    this.scene.clearItems();
    this.floorplan.loadFloorplan(floorplan);
    utils.forEach(items, function(item) {
      position = new THREE.Vector3(
        item.xpos, item.ypos, item.zpos)    
      var metadata = {
        itemName: item.item_name,
        resizable: item.resizable,
        itemType: item.item_type,
        modelUrl: item.model_url
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
