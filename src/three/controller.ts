/// <reference path="../../lib/jQuery.d.ts" />
/// <reference path="../../lib/three.d.ts" />
/// <reference path="../core/utils.ts" />

module BP3D.Three {
  export var Controller = function (three, model, camera, element, controls, hud) {

    var scope = this;

    this.enabled = true;

    var three = three;
    var model = model;
    var scene = model.scene;
    var element = element;
    var camera = camera;
    var controls = controls;
    var hud = hud;

    var plane; // ground plane used for intersection testing

    var mouse;
    var intersectedObject;
    var mouseoverObject;
    var selectedObject;

    var mouseDown = false;
    var mouseMoved = false; // has mouse moved since down click

    var rotateMouseOver = false;

    var states = {
      UNSELECTED: 0, // no object selected
      SELECTED: 1, // selected but inactive
      DRAGGING: 2, // performing an action while mouse depressed
      ROTATING: 3,  // rotating with mouse down
      ROTATING_FREE: 4, // rotating with mouse up
      PANNING: 5
    };
    var state = states.UNSELECTED;

    this.needsUpdate = true;

    function init() {
      element.mousedown(mouseDownEvent);
      element.mouseup(mouseUpEvent);
      element.mousemove(mouseMoveEvent);

      mouse = new THREE.Vector2();

      scene.itemRemovedCallbacks.add(itemRemoved);
      scene.itemLoadedCallbacks.add(itemLoaded);
      setGroundPlane();
    }

    // invoked via callback when item is loaded
    function itemLoaded(item) {
      if (!item.position_set) {
        scope.setSelectedObject(item);
        switchState(states.DRAGGING);
        var pos = item.position.clone();
        pos.y = 0;
        var vec = three.projectVector(pos);
        clickPressed(vec);
      }
      item.position_set = true;
    }

    function clickPressed(vec2?) {
      vec2 = vec2 || mouse;
      var intersection = scope.itemIntersection(mouse, selectedObject);
      if (intersection) {
        selectedObject.clickPressed(intersection);
      }
    }

    function clickDragged(vec2?) {
      vec2 = vec2 || mouse;
      var intersection = scope.itemIntersection(mouse, selectedObject);
      if (intersection) {
        if (scope.isRotating()) {
          selectedObject.rotate(intersection);
        } else {
          selectedObject.clickDragged(intersection);
        }
      }
    }

    function itemRemoved(item) {
      // invoked as a callback to event in Scene
      if (item === selectedObject) {
        selectedObject.setUnselected();
        selectedObject.mouseOff();
        scope.setSelectedObject(null);
      }
    }

    function setGroundPlane() {
      // ground plane used to find intersections
      var size = 10000;
      plane = new THREE.Mesh(
        new THREE.PlaneGeometry(size, size),
        new THREE.MeshBasicMaterial());
      plane.rotation.x = -Math.PI / 2;
      plane.visible = false;
      scene.add(plane);
    }

    function checkWallsAndFloors(event?) {

      // double click on a wall or floor brings up texture change modal
      if (state == states.UNSELECTED && mouseoverObject == null) {
        // check walls
        var wallEdgePlanes = model.floorplan.wallEdgePlanes();
        var wallIntersects = scope.getIntersections(
          mouse, wallEdgePlanes, true);
        if (wallIntersects.length > 0) {
          var wall = wallIntersects[0].object.edge;
          three.wallClicked.fire(wall);
          return;
        }

        // check floors
        var floorPlanes = model.floorplan.floorPlanes();
        var floorIntersects = scope.getIntersections(
          mouse, floorPlanes, false);
        if (floorIntersects.length > 0) {
          var room = floorIntersects[0].object.room;
          three.floorClicked.fire(room);
          return;
        }

        three.nothingClicked.fire();
      }

    }

    function mouseMoveEvent(event) {
      if (scope.enabled) {
        event.preventDefault();

        mouseMoved = true;

        mouse.x = event.clientX;
        mouse.y = event.clientY;

        if (!mouseDown) {
          updateIntersections();
        }

        switch (state) {
          case states.UNSELECTED:
            updateMouseover();
            break;
          case states.SELECTED:
            updateMouseover();
            break;
          case states.DRAGGING:
          case states.ROTATING:
          case states.ROTATING_FREE:
            clickDragged();
            hud.update();
            scope.needsUpdate = true;
            break;
        }
      }
    }

    this.isRotating = function () {
      return (state == states.ROTATING || state == states.ROTATING_FREE);
    }

    function mouseDownEvent(event) {
      if (scope.enabled) {
        event.preventDefault();

        mouseMoved = false;
        mouseDown = true;

        switch (state) {
          case states.SELECTED:
            if (rotateMouseOver) {
              switchState(states.ROTATING);
            } else if (intersectedObject != null) {
              scope.setSelectedObject(intersectedObject);
              if (!intersectedObject.fixed) {
                switchState(states.DRAGGING);
              }
            }
            break;
          case states.UNSELECTED:
            if (intersectedObject != null) {
              scope.setSelectedObject(intersectedObject);
              if (!intersectedObject.fixed) {
                switchState(states.DRAGGING);
              }
            }
            break;
          case states.DRAGGING:
          case states.ROTATING:
            break;
          case states.ROTATING_FREE:
            switchState(states.SELECTED);
            break;
        }
      }
    }

    function mouseUpEvent(event) {
      if (scope.enabled) {
        mouseDown = false;

        switch (state) {
          case states.DRAGGING:
            selectedObject.clickReleased();
            switchState(states.SELECTED);
            break;
          case states.ROTATING:
            if (!mouseMoved) {
              switchState(states.ROTATING_FREE);
            } else {
              switchState(states.SELECTED);
            }
            break;
          case states.UNSELECTED:
            if (!mouseMoved) {
              checkWallsAndFloors();
            }
            break;
          case states.SELECTED:
            if (intersectedObject == null && !mouseMoved) {
              switchState(states.UNSELECTED);
              checkWallsAndFloors();
            }
            break;
          case states.ROTATING_FREE:
            break;
        }
      }
    }

    function switchState(newState) {
      if (newState != state) {
        onExit(state);
        onEntry(newState);
      }
      state = newState;
      hud.setRotating(scope.isRotating());
    }

    function onEntry(state) {
      switch (state) {
        case states.UNSELECTED:
          scope.setSelectedObject(null);
        case states.SELECTED:
          controls.enabled = true;
          break;
        case states.ROTATING:
        case states.ROTATING_FREE:
          controls.enabled = false;
          break;
        case states.DRAGGING:
          three.setCursorStyle("move");
          clickPressed();
          controls.enabled = false;
          break;
      }
    }

    function onExit(state) {
      switch (state) {
        case states.UNSELECTED:
        case states.SELECTED:
          break;
        case states.DRAGGING:
          if (mouseoverObject) {
            three.setCursorStyle("pointer");
          } else {
            three.setCursorStyle("auto");
          }
          break;
        case states.ROTATING:
        case states.ROTATING_FREE:
          break;
      }
    }

    this.selectedObject = function () {
      return selectedObject;
    }

    // updates the vector of the intersection with the plane of a given
    // mouse position, and the intersected object
    // both may be set to null if no intersection found
    function updateIntersections() {

      // check the rotate arrow
      var hudObject = hud.getObject();
      if (hudObject != null) {
        var hudIntersects = scope.getIntersections(
          mouse,
          hudObject,
          false, false, true);
        if (hudIntersects.length > 0) {
          rotateMouseOver = true;
          hud.setMouseover(true);
          intersectedObject = null;
          return;
        }
      }
      rotateMouseOver = false;
      hud.setMouseover(false);

      // check objects
      var items = model.scene.getItems();
      var intersects = scope.getIntersections(
        mouse,
        items,
        false, true);

      if (intersects.length > 0) {
        intersectedObject = intersects[0].object;
      } else {
        intersectedObject = null;
      }
    }

    // sets coords to -1 to 1
    function normalizeVector2(vec2) {
      var retVec = new THREE.Vector2();
      retVec.x = ((vec2.x - three.widthMargin) / (window.innerWidth - three.widthMargin)) * 2 - 1;
      retVec.y = -((vec2.y - three.heightMargin) / (window.innerHeight - three.heightMargin)) * 2 + 1;
      return retVec;
    }

    //
    function mouseToVec3(vec2) {
      var normVec2 = normalizeVector2(vec2)
      var vector = new THREE.Vector3(
        normVec2.x, normVec2.y, 0.5);
      vector.unproject(camera);
      return vector;
    }

    // returns the first intersection object
    this.itemIntersection = function (vec2, item) {
      var customIntersections = item.customIntersectionPlanes();
      var intersections = null;
      if (customIntersections && customIntersections.length > 0) {
        intersections = this.getIntersections(vec2, customIntersections, true);
      } else {
        intersections = this.getIntersections(vec2, plane);
      }
      if (intersections.length > 0) {
        return intersections[0];
      } else {
        return null;
      }
    }

    // filter by normals will only return objects facing the camera
    // objects can be an array of objects or a single object
    this.getIntersections = function (vec2, objects, filterByNormals, onlyVisible, recursive, linePrecision) {

      var vector = mouseToVec3(vec2);

      onlyVisible = onlyVisible || false;
      filterByNormals = filterByNormals || false;
      recursive = recursive || false;
      linePrecision = linePrecision || 20;


      var direction = vector.sub(camera.position).normalize();
      var raycaster = new THREE.Raycaster(
        camera.position,
        direction);
      raycaster.linePrecision = linePrecision;
      var intersections;
      if (objects instanceof Array) {
        intersections = raycaster.intersectObjects(objects, recursive);
      } else {
        intersections = raycaster.intersectObject(objects, recursive);
      }
      // filter by visible, if true
      if (onlyVisible) {
        intersections = Core.Utils.removeIf(intersections, function (intersection) {
          return !intersection.object.visible;
        });
      }

      // filter by normals, if true
      if (filterByNormals) {
        intersections = Core.Utils.removeIf(intersections, function (intersection) {
          var dot = intersection.face.normal.dot(direction);
          return (dot > 0)
        });
      }
      return intersections;
    }

    // manage the selected object
    this.setSelectedObject = function (object) {
      if (state === states.UNSELECTED) {
        switchState(states.SELECTED);
      }
      if (selectedObject != null) {
        selectedObject.setUnselected();
      }
      if (object != null) {
        selectedObject = object;
        selectedObject.setSelected();
        three.itemSelectedCallbacks.fire(object);
      } else {
        selectedObject = null;
        three.itemUnselectedCallbacks.fire();
      }
      this.needsUpdate = true;
    }

    // TODO: there MUST be simpler logic for expressing this
    function updateMouseover() {
      if (intersectedObject != null) {
        if (mouseoverObject != null) {
          if (mouseoverObject !== intersectedObject) {
            mouseoverObject.mouseOff();
            mouseoverObject = intersectedObject;
            mouseoverObject.mouseOver();
            scope.needsUpdate = true;
          } else {
            // do nothing, mouseover already set
          }
        } else {
          mouseoverObject = intersectedObject;
          mouseoverObject.mouseOver();
          three.setCursorStyle("pointer");
          scope.needsUpdate = true;
        }
      } else if (mouseoverObject != null) {
        mouseoverObject.mouseOff();
        three.setCursorStyle("auto");
        mouseoverObject = null;
        scope.needsUpdate = true;
      }
    }

    init();
  }
}
