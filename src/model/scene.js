var THREE = require('three')

var JQUERY = require('jquery');

var FloorItem = require('../items/floor_item');
var InWallFloorItem = require('../items/in_wall_floor_item');
var InWallItem = require('../items/in_wall_item');
var Item = require('../items/item');
var OnFloorItem = require('../items/on_floor_item');
var WallFloorItem = require('../items/wall_floor_item');
var WallItem = require('../items/wall_item');

var utils = require('../utils/utils')


var Scene = function(model, textureDir) {
  var scope = this;
  var model = model;
  var textureDir = textureDir;

  var scene = new THREE.Scene();
  var items = [];

  this.needsUpdate = false;

  // init item loader
  var loader = new THREE.JSONLoader();
  loader.crossOrigin = "";
  
  var item_types = {
    1: FloorItem,
    2: WallItem,
    3: InWallItem,
    7: InWallFloorItem,
    8: OnFloorItem,
    9: WallFloorItem
  };

  // init callbacks
  this.itemLoadingCallbacks = JQUERY.Callbacks(); 
  this.itemLoadedCallbacks = JQUERY.Callbacks(); // Item
  this.itemRemovedCallbacks = JQUERY.Callbacks(); // Item

  this.add = function(mesh) {
    // only use this for non-items
    scene.add(mesh);
  }

  this.remove = function(mesh) {
    // only use  this for non-items
    scene.remove(mesh);
    utils.removeValue(items, mesh);
  }

  this.getScene = function() {
    return scene;
  }

  this.getItems = function() {
    return items;
  }

  this.itemCount = function() {
    return items.length
  }

  this.clearItems = function() {
    items_copy = items
    utils.forEach(items, function(item) {
      scope.removeItem(item, true);
    });
    items = []
  }

  this.removeItem = function(item, dontRemove) {
    dontRemove = dontRemove || false;
    // use this for item meshes
    this.itemRemovedCallbacks.fire(item);
    item.removed();
    scene.remove(item);
    if (!dontRemove) {
      utils.removeValue(items, item);
    }
  }

  this.addItem = function(itemType, fileName, metadata, position, rotation, scale, fixed) {
    itemType = itemType || 1;

    var loaderCallback = function(geometry, materials) {
      var item = new item_types[itemType](
        model,
        metadata, geometry,
        new THREE.MeshFaceMaterial(materials),
        position, rotation, scale
      );
      item.fixed = fixed || false;
      items.push(item);
      scope.add(item);
      item.initObject();
      scope.itemLoadedCallbacks.fire(item);
    }

    scope.itemLoadingCallbacks.fire();
    loader.load(
      fileName,
      loaderCallback,
      textureDir
    );
  }
}

module.exports = Scene;
