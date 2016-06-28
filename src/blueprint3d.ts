/// <reference path="three/main.ts" />
/// <reference path="model/model.ts" />
/// <reference path="floorplanner/floorplanner.ts" />

var Blueprint3d = function (opts) {
	// opts.threeElement
	// opts.floorplannerElement
	// opts.textureDir

	this.model = new BP3D.Model.Model(opts.textureDir);
	this.three = new BP3D.Three.Main(this.model, opts.threeElement, opts.threeCanvasElement, {});
	if (!opts.widget) {
		this.floorplanner = new BP3D.Floorplanner(opts.floorplannerElement, this.model.floorplan);
	}
	else {
		this.three.getController().enabled = false;
	}
}

