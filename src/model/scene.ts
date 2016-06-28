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
  const item_types = {
    1: Items.FloorItem,
    2: Items.WallItem,
    3: Items.InWallItem,
    7: Items.InWallFloorItem,
    8: Items.OnFloorItem,
    9: Items.WallFloorItem
  };

  /** */
  export class Scene {

    /** */
    private scene: THREE.Scene;

    /** */
    private items = [];

    /** */
    private needsUpdate = false;

    /** */
    private loader: THREE.JSONLoader;

    /** */
    private itemLoadingCallbacks: JQueryCallback;

    /** */
    private itemLoadedCallbacks: JQueryCallback;

    /** */
    private itemRemovedCallbacks: JQueryCallback;

    constructor(private model: Model, private textureDir: string) {

      this.scene = new THREE.Scene();

      // init item loader
      this.loader = new THREE.JSONLoader();
      this.loader.crossOrigin = "";

      // init callbacks
      this.itemLoadingCallbacks = $.Callbacks();
      this.itemLoadedCallbacks = $.Callbacks(); // Item
      this.itemRemovedCallbacks = $.Callbacks(); // Item
    }

    private add(mesh) {
      // only use this for non-items
      this.scene.add(mesh);
    }

    private remove(mesh) {
      // only use  this for non-items
      this.scene.remove(mesh);
      Utils.removeValue(this.items, mesh);
    }

    public getScene() {
      return this.scene;
    }

    public getItems() {
      return this.items;
    }

    public itemCount() {
      return this.items.length
    }

    public clearItems() {
      var items_copy = this.items
      var scope = this;
      Utils.forEach(this.items, function (item) {
        scope.removeItem(item, true);
      });
      this.items = []
    }

    private removeItem(item, dontRemove) {
      dontRemove = dontRemove || false;
      // use this for item meshes
      this.itemRemovedCallbacks.fire(item);
      item.removed();
      this.scene.remove(item);
      if (!dontRemove) {
        Utils.removeValue(this.items, item);
      }
    }

    private addItem(itemType, fileName, metadata, position, rotation, scale, fixed) {
      itemType = itemType || 1;

      var loaderCallback = function (geometry, materials) {
        var item = new item_types[itemType](
          this.model,
          metadata, geometry,
          new THREE.MeshFaceMaterial(materials),
          position, rotation, scale
        );
        item.fixed = fixed || false;
        this.items.push(item);
        this.scope.add(item);
        item.initObject();
        this.scope.itemLoadedCallbacks.fire(item);
      }

      this.itemLoadingCallbacks.fire();
      this.loader.load(
        fileName,
        loaderCallback,
        undefined // TODO_Ekki this.textureDir
      );
    }
  }
}
