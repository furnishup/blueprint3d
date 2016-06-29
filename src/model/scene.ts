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
  /** */
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

    /** The associated ThreeJS scene. */
    private scene: THREE.Scene;

    /** */
    private items: Items.Item[] = [];

    /** */
    public needsUpdate = false;

    /** The Json loader. */
    private loader: THREE.JSONLoader;

    /** */
    private itemLoadingCallbacks = $.Callbacks();

    /** Item */
    private itemLoadedCallbacks = $.Callbacks();

    /** Item */
    private itemRemovedCallbacks = $.Callbacks();

    /**
     * Constructs a scene.
     * @param model The associated model.
     * @param textureDir The directory from which to load the textures.
     */
    constructor(private model: Model, private textureDir: string) {

      this.scene = new THREE.Scene();

      // init item loader
      this.loader = new THREE.JSONLoader();
      this.loader.crossOrigin = "";
    }

    /**
     * Only use this for non-items.
     */
    public add(mesh) {
      this.scene.add(mesh);
    }

    /**
     * Only use this for non-items.
     */
    public remove(mesh) {
      this.scene.remove(mesh);
      Utils.removeValue(this.items, mesh);
    }

    /** Gets the scene. */
    public getScene(): THREE.Scene {
      return this.scene;
    }

    /** Gets the items. */
    public getItems(): Items.Item[] {
      return this.items;
    }

    /** Gets the count of items. */
    public itemCount(): number {
      return this.items.length
    }

    /** Removes all items. */
    public clearItems() {
      var items_copy = this.items
      var scope = this;
      Utils.forEach(this.items, (item) => {
        scope.removeItem(item, true);
      });
      this.items = []
    }

    /**
     * Removes an item.
     * @param item The item to be removed.
     * @param dontRemove If not set, also remove the item from the items list.
     */
    public removeItem(item: Items.Item, dontRemove?: boolean) {
      dontRemove = dontRemove || false;
      // use this for item meshes
      this.itemRemovedCallbacks.fire(item);
      item.removed();
      this.scene.remove(item);
      if (!dontRemove) {
        Utils.removeValue(this.items, item);
      }
    }

    /**
     * Creates an item and adds it to the scene.
     * @param itemType The type of the item given by an enumerator.
     * @param fileName The name of the file to load.
     * @param metadata TODO
     * @param position The initial position.
     * @param rotation The initial rotation around the y axis.
     * @param scale The initial scaling.
     * @param fixed True if fixed.
     */
    public addItem(itemType: number, fileName: string, metadata, position: THREE.Vector3, rotation: number, scale: THREE.Vector3, fixed: boolean) {
      itemType = itemType || 1;
      var loaderCallback = function (geometry: THREE.Geometry, materials: THREE.Material[]) {
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
        undefined // TODO_Ekki 
      );
    }
  }
}
