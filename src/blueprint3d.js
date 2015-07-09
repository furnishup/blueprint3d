var ThreeMain = require('./three/three_main.js');
var Model = require('./model/model.js');
var Floorplanner = require('./floorplanner/floorplanner');

global.Blueprint3d = function(opts) {
  // opts.threeElement
  // opts.floorplannerElement
  // opts.textureDir
  
  this.model = new Model(opts.textureDir);
  this.three = new ThreeMain(this.model, opts.threeElement, opts.threeCanvasElement, {});
  if (!opts.widget) {
    this.floorplanner = new Floorplanner(opts.floorplannerElement, this.model.floorplan);    
  } else {
    this.three.getController().enabled = false;
  }
}

