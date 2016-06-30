/// <reference path="../../lib/three.d.ts" />
/// <reference path="../core/utils.ts" />

module BP3D.Three {
  export var Floor = function (scene, room) {

    var scope = this;

    this.room = room;
    var scene = scene;

    var floorPlane = null;
    var roofPlane = null;

    init();

    function init() {
      scope.room.fireOnFloorChange(redraw);
      floorPlane = buildFloor();
      // roofs look weird, so commented out
      //roofPlane = buildRoof();
    }

    function redraw() {
      scope.removeFromScene();
      floorPlane = buildFloor();
      scope.addToScene();
    }

    function buildFloor() {
      var textureSettings = scope.room.getTexture();
      // setup texture
      var floorTexture = THREE.ImageUtils.loadTexture(textureSettings.url);
      floorTexture.wrapS = THREE.RepeatWrapping;
      floorTexture.wrapT = THREE.RepeatWrapping;
      floorTexture.repeat.set(1, 1);
      var floorMaterialTop = new THREE.MeshPhongMaterial({
        map: floorTexture,
        side: THREE.DoubleSide,
        // ambient: 0xffffff, TODO_Ekki
        color: 0xcccccc,
        specular: 0x0a0a0a
      });

      var textureScale = textureSettings.scale;
      // http://stackoverflow.com/questions/19182298/how-to-texture-a-three-js-mesh-created-with-shapegeometry
      // scale down coords to fit 0 -> 1, then rescale

      var points = [];
      scope.room.interiorCorners.forEach((corner) => {
        points.push(new THREE.Vector2(
          corner.x / textureScale,
          corner.y / textureScale));
      });
      var shape = new THREE.Shape(points);

      var geometry = new THREE.ShapeGeometry(shape);

      var floor = new THREE.Mesh(geometry, floorMaterialTop);

      floor.rotation.set(Math.PI / 2, 0, 0);
      floor.scale.set(textureScale, textureScale, textureScale);
      floor.receiveShadow = true;
      floor.castShadow = false;
      return floor;
    }

    function buildRoof() {
      // setup texture
      var roofMaterial = new THREE.MeshBasicMaterial({
        side: THREE.FrontSide,
        color: 0xe5e5e5
      });

      var points = [];
      scope.room.interiorCorners.forEach((corner) => {
        points.push(new THREE.Vector2(
          corner.x,
          corner.y));
      });
      var shape = new THREE.Shape(points);
      var geometry = new THREE.ShapeGeometry(shape);
      var roof = new THREE.Mesh(geometry, roofMaterial);

      roof.rotation.set(Math.PI / 2, 0, 0);
      roof.position.y = 250;
      return roof;
    }

    this.addToScene = function () {
      scene.add(floorPlane);
      //scene.add(roofPlane);
      // hack so we can do intersect testing
      scene.add(room.floorPlane);
    }

    this.removeFromScene = function () {
      scene.remove(floorPlane);
      //scene.remove(roofPlane);
      scene.remove(room.floorPlane);
    }
  }
}
