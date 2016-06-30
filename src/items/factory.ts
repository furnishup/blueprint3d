/// <reference path="floor_item.ts" />
/// <reference path="in_wall_floor_item.ts" />
/// <reference path="in_wall_item.ts" />
/// <reference path="on_floor_item.ts" />
/// <reference path="wall_floor_item.ts" />
/// <reference path="wall_item.ts" />

module BP3D.Items {
  /** Enumeration of item types. */
  const item_types = {
    1: Items.FloorItem,
    2: Items.WallItem,
    3: Items.InWallItem,
    7: Items.InWallFloorItem,
    8: Items.OnFloorItem,
    9: Items.WallFloorItem
  };

  /** Factory class to create items. */
  export class Factory {
    /** Gets the class for the specified item. */
    public static getClass(itemType) { 
      return item_types[itemType]
    }
  }
}