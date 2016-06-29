/// <reference path="three/main.ts" />
/// <reference path="model/model.ts" />
/// <reference path="floorplanner/floorplanner.ts" />

module BP3D {
  /** */
  export var Blueprint3d = function (opts) {
    // opts.threeElement
    // opts.floorplannerElement
    // opts.textureDir

    this.model = new Model.Model(opts.textureDir);
    this.three = new Three.Main(this.model, opts.threeElement, opts.threeCanvasElement, {});
    if (!opts.widget) {
      this.floorplanner = new Floorplanner.Floorplanner(opts.floorplannerElement, this.model.floorplan);
    }
    else {
      this.three.getController().enabled = false;
    }
  }
}
