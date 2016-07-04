var THREE = require('three')
var utils = require('../utils/utils')

var ThreeEdge = function(scene, edge, controls) {
  var scope = this;
  var scene = scene;
  var edge = edge;
  var controls = controls;
  var wall = edge.wall;
  var front = edge.front;

  var planes = [];
  var basePlanes = []; // always visible
  var texture = null;
  
  var lightMap = THREE.ImageUtils.loadTexture("rooms/textures/walllightmap.png");
  var fillerColor = 0xdddddd;
  var sideColor = 0xcccccc;
  var baseColor = 0xdddddd;

  this.visible = false;

  this.remove = function() {
    edge.redrawCallbacks.remove(redraw);
    controls.cameraMovedCallbacks.remove(updateVisibility);
    removeFromScene();
  }

  function init() {
    edge.redrawCallbacks.add(redraw);
    controls.cameraMovedCallbacks.add(updateVisibility);
    updateTexture();
    updatePlanes();
    addToScene();
  }

  function redraw() {
    removeFromScene();
    updateTexture();
    updatePlanes();
    addToScene();
  }

  function removeFromScene() {
    utils.forEach(planes, function(plane) {
      scene.remove(plane);
    });
    utils.forEach(basePlanes, function(plane) {
      scene.remove(plane);
    });
    planes = [];
    basePlanes = [];
  }

  function addToScene() {
    utils.forEach(planes, function(plane) {
      scene.add(plane);
    });
    utils.forEach(basePlanes, function(plane) {
      scene.add(plane);
    });
    updateVisibility();
  }

  function updateVisibility() {
    // finds the normal from the specified edge
    var start = edge.interiorStart();
    var end = edge.interiorEnd();
    var x = end.x - start.x;
    var y = end.y - start.y;
    // rotate 90 degrees CCW
    var normal = new THREE.Vector3(-y, 0, x);
    normal.normalize();

    // setup camera
    var position = controls.object.position.clone();
    var focus = new THREE.Vector3(
      (start.x + end.x) / 2.0,
      0,
      (start.y + end.y) / 2.0);
    var direction = position.sub(focus).normalize();

    // find dot
    var dot = normal.dot(direction);

    // update visible
    scope.visible = (dot >= 0);

    // show or hide plans
    utils.forEach(planes, function(plane) { 
      plane.visible = scope.visible;
    });

    updateObjectVisibility();
  }

  function updateObjectVisibility() {
    utils.forEach(wall.items, function(item) {
      item.updateEdgeVisibility(scope.visible, front);
    });
    utils.forEach(wall.onItems, function(item) {
      item.updateEdgeVisibility(scope.visible, front);
    });
  } 


  function updateTexture(callback) {
    // callback is fired when texture loads
    callback = callback || function() {
      scene.needsUpdate = true;
    }
    var textureData = edge.getTexture();
    var stretch = textureData.stretch;
    var url = textureData.url;
    var scale = textureData.scale;
    texture = THREE.ImageUtils.loadTexture(url, null, callback);
    if (!stretch) {
      var height = wall.height;
      var width = edge.interiorDistance(); 
      texture.wrapT = THREE.RepeatWrapping;
      texture.wrapS = THREE.RepeatWrapping;
      texture.repeat.set(width/scale, height/scale);
      texture.needsUpdate = true;
    }
  }

  function updatePlanes() {
    var wallMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      ambientColor: 0xffffff,
      //ambient: scope.wall.color,
      side: THREE.FrontSide,
      map: texture,
      lightMap: lightMap
    });
    
    var fillerMaterial = new THREE.MeshBasicMaterial({
      color: fillerColor,
      side: THREE.DoubleSide
    });  

    // exterior plane
    planes.push(makeWall(
      edge.exteriorStart(), 
      edge.exteriorEnd(),
      edge.exteriorTransform,
      edge.invExteriorTransform,
      fillerMaterial));

    // interior plane
    planes.push(makeWall(
      edge.interiorStart(), 
      edge.interiorEnd(),
      edge.interiorTransform,
      edge.invInteriorTransform,
      wallMaterial));

    // bottom
    // put into basePlanes since this is always visible
    basePlanes.push(buildFiller(
      edge, 0, 
      THREE.BackSide, baseColor)); 

    // top
    planes.push(buildFiller(
      edge, wall.height, 
      THREE.DoubleSide, fillerColor));

    // sides
    planes.push(buildSideFillter(
      edge.interiorStart(), edge.exteriorStart(), 
      wall.height, sideColor));

    planes.push(buildSideFillter(
      edge.interiorEnd(), edge.exteriorEnd(), 
      wall.height, sideColor));
  }

  // start, end have x and y attributes (i.e. corners)
  function makeWall(start, end, transform, invTransform, material) {
    v1 = toVec3(start);
    v2 = toVec3(end);
    v3 = v2.clone();
    v3.y = wall.height;
    v4 = v1.clone();
    v4.y = wall.height;

    var points = [v1.clone(), v2.clone(), v3.clone(), v4.clone()];

    utils.forEach(points, function(p) {
      p.applyMatrix4(transform);
    });

    var shape = new THREE.Shape(points);

    // add holes for each wall item
    utils.forEach(wall.items, function(item) {
      var pos = item.position.clone();
      pos.applyMatrix4(transform)
      var halfSize = item.halfSize;
      var min = halfSize.clone().multiplyScalar(-1);
      var max = halfSize.clone();
      min.add(pos);
      max.add(pos);

      var holePoints = [
        new THREE.Vector3(min.x, min.y, 0),
        new THREE.Vector3(max.x, min.y, 0),
        new THREE.Vector3(max.x, max.y, 0),
        new THREE.Vector3(min.x, max.y, 0)
      ];

      shape.holes.push(new THREE.Path(holePoints));
    });

    var geometry = new THREE.ShapeGeometry(shape);

    utils.forEach(geometry.vertices, function(v) {
      v.applyMatrix4(invTransform);
    });

    // make UVs
    var totalDistance = utils.distance(v1.x, v1.z, v2.x, v2.z);
    var height = wall.height;
    geometry.faceVertexUvs[0] = [];

    function vertexToUv(vertex) {
      var x = utils.distance(v1.x, v1.z, vertex.x, vertex.z) / totalDistance;
      var y = vertex.y / height;
      return new THREE.Vector2(x, y);
    }

    utils.forEach(geometry.faces, function(face) {
      var vertA = geometry.vertices[face.a];
      var vertB = geometry.vertices[face.b];
      var vertC = geometry.vertices[face.c];
      geometry.faceVertexUvs[0].push([
          vertexToUv(vertA),
          vertexToUv(vertB),
          vertexToUv(vertC)]);      
    });

    geometry.faceVertexUvs[1] = geometry.faceVertexUvs[0];

    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    var mesh = new THREE.Mesh(
        geometry,
        material);

    return mesh;
  }

  function buildSideFillter(p1, p2, height, color) {
    var points = [
      toVec3(p1),
      toVec3(p2),
      toVec3(p2, height),
      toVec3(p1, height)
    ];

    var geometry = new THREE.Geometry(); 
    utils.forEach(points, function(p){
      geometry.vertices.push(p);
    });
    geometry.faces.push(new THREE.Face3(0, 1, 2));
    geometry.faces.push(new THREE.Face3(0, 2, 3));

    var fillerMaterial = new THREE.MeshBasicMaterial({
      color: color,
      side: THREE.DoubleSide
    });  

    var filler = new THREE.Mesh(geometry, fillerMaterial);
    return filler;
  }

  function buildFiller(edge, height, side, color) {
    var points = [
      toVec2(edge.exteriorStart()),
      toVec2(edge.exteriorEnd()),
      toVec2(edge.interiorEnd()),
      toVec2(edge.interiorStart())
    ];

    var fillerMaterial = new THREE.MeshBasicMaterial({
      color: color,
      side: side
    });  

    var shape = new THREE.Shape(points);
    var geometry = new THREE.ShapeGeometry(shape);

    var filler = new THREE.Mesh(geometry, fillerMaterial);
    filler.rotation.set(Math.PI/2, 0, 0);
    filler.position.y = height;
    return filler;
  }

  function toVec2(pos) {
    return new THREE.Vector2(pos.x, pos.y);
  }

  function toVec3(pos, height) {
    height = height || 0;
    return new THREE.Vector3(pos.x, height, pos.y);
  }

  init();
}

module.exports = ThreeEdge;
