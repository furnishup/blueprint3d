/// <reference path="../../lib/three.d.ts" />
/// <reference path="../../lib/jQuery.d.ts" />
/// <reference path="../utils/utils.ts" />
/// <reference path="../items/floor_item.ts" />
/// <reference path="../items/in_wall_floor_item.ts" />
/// <reference path="../items/in_wall_item.ts" />
/// <reference path="../items/Item.ts" />
/// <reference path="../items/on_floor_item.ts" />
/// <reference path="../items/wall_floor_item.ts" />
/// <reference path="../items/wall_item.ts" />

module BP3D.Model {
  export var Scene = function (model, textureDir) {
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
      1: Items.FloorItem,
      2: Items.WallItem,
      3: Items.InWallItem,
      7: Items.InWallFloorItem,
      8: Items.OnFloorItem,
      9: Items.WallFloorItem
    };

    // init callbacks
    this.itemLoadingCallbacks = $.Callbacks();
    this.itemLoadedCallbacks = $.Callbacks(); // Item
    this.itemRemovedCallbacks = $.Callbacks(); // Item

    this.add = function (mesh) {
      // only use this for non-items
      scene.add(mesh);
    }

    this.remove = function (mesh) {
      // only use  this for non-items
      scene.remove(mesh);
      Utils.removeValue(items, mesh);
    }

    this.getScene = function () {
      return scene;
    }

    this.getItems = function () {
      return items;
    }

    this.itemCount = function () {
      return items.length
    }

    this.clearItems = function () {
      var items_copy = items
      Utils.forEach(items, function (item) {
        scope.removeItem(item, true);
      });
      items = []
    }

    this.removeItem = function (item, dontRemove) {
      dontRemove = dontRemove || false;
      // use this for item meshes
      this.itemRemovedCallbacks.fire(item);
      item.removed();
      scene.remove(item);
      if (!dontRemove) {
        Utils.removeValue(items, item);
      }
    }

    this.addItem = function (itemType, fileName, metadata, position, rotation, scale, fixed) {
      itemType = itemType || 1;

      var loaderCallback = function (geometry, materials) {
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
}
