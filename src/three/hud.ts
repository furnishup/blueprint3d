/// <reference path="../../lib/three.d.ts" />
/// <reference path="../core/utils.ts" />

module BP3D.Three {
  /**
   * Drawings on "top" of the scene. e.g. rotate arrows
   */
  export var HUD = function (three) {
    var scope = this;
    var three = three;
    var scene = new THREE.Scene();

    var selectedItem = null;

    var rotating = false;
    var mouseover = false;

    var tolerance = 10;
    var height = 5;
    var distance = 20;
    var color = "#ffffff";
    var hoverColor = "#f1c40f";

    var activeObject = null;

    this.getScene = function () {
      return scene;
    }

    this.getObject = function () {
      return activeObject;
    }

    function init() {
      three.itemSelectedCallbacks.add(itemSelected);
      three.itemUnselectedCallbacks.add(itemUnselected);
    }

    function resetSelectedItem() {
      selectedItem = null;
      if (activeObject) {
        scene.remove(activeObject);
        activeObject = null;
      }
    }

    function itemSelected(item) {
      if (selectedItem != item) {
        resetSelectedItem();
        if (item.allowRotate && !item.fixed) {
          selectedItem = item;
          activeObject = makeObject(selectedItem);
          scene.add(activeObject);
        }
      }
    }

    function itemUnselected() {
      resetSelectedItem();
    }

    this.setRotating = function (isRotating) {
      rotating = isRotating;
      setColor();
    }

    this.setMouseover = function (isMousedOver) {
      mouseover = isMousedOver;
      setColor();
    }

    function setColor() {
      if (activeObject) {
        activeObject.children.forEach((obj) => {
          obj.material.color.set(getColor());
        });
      }
      three.needsUpdate();
    }

    function getColor() {
      return (mouseover || rotating) ? hoverColor : color;
    }

    this.update = function () {
      if (activeObject) {
        activeObject.rotation.y = selectedItem.rotation.y;
        activeObject.position.x = selectedItem.position.x;
        activeObject.position.z = selectedItem.position.z;
      }
    }

    function makeLineGeometry(item) {
      var geometry = new THREE.Geometry();

      geometry.vertices.push(
        new THREE.Vector3(0, 0, 0),
        rotateVector(item)
      );

      return geometry;
    }

    function rotateVector(item) {
      var vec = new THREE.Vector3(0, 0,
        Math.max(item.halfSize.x, item.halfSize.z) + 1.4 + distance);
      return vec;
    }

    function makeLineMaterial(rotating) {
      var mat = new THREE.LineBasicMaterial({
        color: getColor(),
        linewidth: 3
      });
      return mat;
    }

    function makeCone(item) {
      var coneGeo = new THREE.CylinderGeometry(5, 0, 10);
      var coneMat = new THREE.MeshBasicMaterial({
        color: getColor()
      });
      var cone = new THREE.Mesh(coneGeo, coneMat);
      cone.position.copy(rotateVector(item));

      cone.rotation.x = -Math.PI / 2.0;

      return cone;
    }

    function makeSphere(item) {
      var geometry = new THREE.SphereGeometry(4, 16, 16);
      var material = new THREE.MeshBasicMaterial({
        color: getColor()
      });
      var sphere = new THREE.Mesh(geometry, material);
      return sphere;
    }

    function makeObject(item) {
      var object = new THREE.Object3D();
      var line = new THREE.Line(
        makeLineGeometry(item),
        makeLineMaterial(scope.rotating),
        THREE.LinePieces);

      var cone = makeCone(item);
      var sphere = makeSphere(item);

      object.add(line);
      object.add(cone);
      object.add(sphere);

      object.rotation.y = item.rotation.y;
      object.position.x = item.position.x;
      object.position.z = item.position.z;
      object.position.y = height;

      return object;
    }

    init();
  }
}
