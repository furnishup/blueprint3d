/// <reference path="../../lib/three.d.ts" />

module BP3D.Three {
  export var Skybox = function (scene) {

    var scope = this;

    var scene = scene;

    var topColor = 0xffffff;//0xD8ECF9
    var bottomColor = 0xe9e9e9; //0xf9f9f9;//0x565e63
    var verticalOffset = 500
    var sphereRadius = 4000
    var widthSegments = 32
    var heightSegments = 15

    var vertexShader = [
      "varying vec3 vWorldPosition;",
      "void main() {",
      "  vec4 worldPosition = modelMatrix * vec4( position, 1.0 );",
      "  vWorldPosition = worldPosition.xyz;",
      "  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
      "}"
    ].join('\n');

    var fragmentShader = [
      "uniform vec3 topColor;",
      "uniform vec3 bottomColor;",
      "uniform float offset;",
      "varying vec3 vWorldPosition;",
      "void main() {",
      "  float h = normalize( vWorldPosition + offset ).y;",
      "  gl_FragColor = vec4( mix( bottomColor, topColor, (h + 1.0) / 2.0), 1.0 );",
      "}"
    ].join('\n');

    function init() {

      var uniforms = {
        topColor: {
          type: "c",
          value: new THREE.Color(topColor)
        },
        bottomColor: {
          type: "c",
          value: new THREE.Color(bottomColor)
        },
        offset: {
          type: "f",
          value: verticalOffset
        }
      }

      var skyGeo = new THREE.SphereGeometry(
        sphereRadius, widthSegments, heightSegments);
      var skyMat = new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: uniforms,
        side: THREE.BackSide
      });

      var sky = new THREE.Mesh(skyGeo, skyMat);
      scene.add(sky);
    }

    init();
  }
}
