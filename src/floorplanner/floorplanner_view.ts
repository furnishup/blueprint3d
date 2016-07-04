var JQUERY = require('jquery');
var utils = require('../utils/utils')


var FloorplannerView = function(floorplan, viewmodel, canvas) {

  var scope = this;
  var floorplan = floorplan;
  var viewmodel = viewmodel;
  var canvas = canvas;
  var canvasElement = document.getElementById(canvas);
  var context = canvasElement.getContext('2d');

  // grid parameters
  var gridSpacing = 20; // pixels
  var gridWidth = 1;
  var gridColor = "#f1f1f1";

  // room config
  var roomColor = "#f9f9f9";

  // wall config
  var wallWidth = 5;
  var wallWidthHover = 7;
  var wallColor = "#dddddd"
  var wallColorHover = "#008cba"
  var edgeColor = "#888888"
  var edgeColorHover = "#008cba"
  var edgeWidth = 1

  var deleteColor = "#ff0000";

  // corner config
  var cornerRadius = 0
  var cornerRadiusHover = 7
  var cornerColor = "#cccccc"
  var cornerColorHover = "#008cba"

  function init() {
    JQUERY(window).resize(scope.handleWindowResize);
    scope.handleWindowResize();
  }

  this.handleWindowResize = function() {
    var canvasSel = JQUERY("#"+canvas);
    var parent = canvasSel.parent();
    canvasSel.height(parent.innerHeight());
    canvasSel.width(parent.innerWidth());
    canvasElement.height = parent.innerHeight();
    canvasElement.width = parent.innerWidth(); 
    scope.draw();
  }

  this.draw = function() {
    context.clearRect(0, 0, canvasElement.width, canvasElement.height);
    drawGrid();
    utils.forEach(floorplan.getRooms(), drawRoom);
    utils.forEach(floorplan.getWalls(), drawWall);
    utils.forEach(floorplan.getCorners(), drawCorner);
    if (viewmodel.mode == viewmodel.modes.DRAW) {
      drawTarget(viewmodel.targetX, viewmodel.targetY, viewmodel.lastNode);
    }
    utils.forEach(floorplan.getWalls(), drawWallLabels);
  }

  function drawWallLabels(wall) {
    // we'll just draw the shorter label... idk
    if (wall.backEdge && wall.frontEdge) {
      if (wall.backEdge.interiorDistance < wall.frontEdge.interiorDistance) {
        drawEdgeLabel(wall.backEdge);
      } else {
        drawEdgeLabel(wall.frontEdge);
      }
    } else if (wall.backEdge) {
      drawEdgeLabel(wall.backEdge);
    } else if (wall.frontEdge) {
      drawEdgeLabel(wall.frontEdge);
    }
  }

  function drawWall(wall) {
    var hover = (wall === viewmodel.activeWall);
    var color = wallColor;
    if (hover && viewmodel.mode == viewmodel.modes.DELETE) {
      color = deleteColor;
    } else if (hover) {
      color = wallColorHover;
    } 
    drawLine(
      viewmodel.convertX(wall.getStartX()),
      viewmodel.convertY(wall.getStartY()),
      viewmodel.convertX(wall.getEndX()),
      viewmodel.convertY(wall.getEndY()),
      hover ? wallWidthHover : wallWidth,
      color
    );
    if (!hover && wall.frontEdge) {
      drawEdge(wall.frontEdge, hover);
    }
    if (!hover && wall.backEdge) {
      drawEdge(wall.backEdge, hover);
    }
  }

  function cmToFeet(cm) {
    var realFeet = ((cm*0.393700) / 12);
    var feet = Math.floor(realFeet);
    var inches = Math.round((realFeet - feet) * 12);
    return feet + "'" + inches + '"';
  }

  function drawEdgeLabel(edge) {
    var pos = edge.interiorCenter();
    var length = edge.interiorDistance();
    if (length < 60) {
      // dont draw labels on walls this short
      return;
    }
    context.font = "normal 12px Arial";
    context.fillStyle = "#000000";
    context.textBaseline = "middle";
    context.textAlign = "center";
    context.strokeStyle = "#ffffff";
    context.lineWidth  = 4;

    context.strokeText(cmToFeet(length), 
      viewmodel.convertX(pos.x), 
      viewmodel.convertY(pos.y));
    context.fillText(cmToFeet(length), 
      viewmodel.convertX(pos.x), 
      viewmodel.convertY(pos.y));
  }

  function drawEdge(edge, hover) {
    var color = edgeColor;
    if (hover && viewmodel.mode == viewmodel.modes.DELETE) {
      color = deleteColor;
    } else if (hover) {
      color = edgeColorHover;
    } 
    corners = edge.corners();
    drawPolygon(
      utils.map(corners, function(corner) {
        return viewmodel.convertX(corner.x);
      }), 
      utils.map(corners, function(corner) {
        return viewmodel.convertY(corner.y);
      }), 
      false,
      null,
      true,
      color,
      edgeWidth
    ); 
  }

  function drawRoom(room) {
    drawPolygon(
      utils.map(room.corners, function(corner) {
        return viewmodel.convertX(corner.x);
      }), 
      utils.map(room.corners, function(corner) {
        return viewmodel.convertY(corner.y);
      }), 
      true,
      roomColor
    );
  }

  function drawCorner(corner) {
    var hover = (corner === viewmodel.activeCorner);
    var color = cornerColor;
    if (hover && viewmodel.mode == viewmodel.modes.DELETE) {
      color = deleteColor;
    } else if (hover) {
      color = cornerColorHover;
    } 
    drawCircle(
      viewmodel.convertX(corner.x), 
      viewmodel.convertY(corner.y), 
      hover ? cornerRadiusHover : cornerRadius, 
      color
    );
  }

  function drawTarget(x, y, lastNode) {
    drawCircle(
      viewmodel.convertX(x), 
      viewmodel.convertY(y), 
      cornerRadiusHover, 
      cornerColorHover
    );
    if (viewmodel.lastNode) {
      drawLine(
        viewmodel.convertX(lastNode.x),
        viewmodel.convertY(lastNode.y),
        viewmodel.convertX(x),
        viewmodel.convertY(y),
        wallWidthHover,
        wallColorHover
      );
    }
  }

  function drawLine(startX, startY, endX, endY, width, color) {
    // width is an integer
    // color is a hex string, i.e. #ff0000
    context.beginPath();
    context.moveTo(startX, startY);
    context.lineTo(endX, endY);
    context.lineWidth = width;
    context.strokeStyle = color;
    context.stroke();
  }

  function drawPolygon(xArr, yArr, fill, fillColor, stroke, strokeColor, strokeWidth) {
    // fillColor is a hex string, i.e. #ff0000
    fill = fill || false;
    stroke = stroke || false;
    context.beginPath();
    context.moveTo(xArr[0], yArr[0]);
    for (var i = 1; i < xArr.length; i++) {
      context.lineTo(xArr[i], yArr[i]);
    }
    context.closePath();
    if (fill) {
      context.fillStyle = fillColor;
      context.fill();   
    }
    if (stroke) {
      context.lineWidth = strokeWidth;
      context.strokeStyle = strokeColor;
      context.stroke();
    }

  }

  function drawCircle(centerX, centerY, radius, fillColor) {
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.fillStyle = fillColor;
    context.fill();
  }

  // returns n where -gridSize/2 < n <= gridSize/2 
  function calculateGridOffset(n) {
    if (n >= 0) {
      return (n + gridSpacing/2.0) % gridSpacing - gridSpacing/2.0;
    } else {
      return (n - gridSpacing/2.0) % gridSpacing + gridSpacing/2.0;  
    }
  }

  function drawGrid() {
    var offsetX = calculateGridOffset(-viewmodel.originX);
    var offsetY = calculateGridOffset(-viewmodel.originY);
    var width = canvasElement.width;
    var height = canvasElement.height;
    for (var x=0; x <= (width / gridSpacing); x++) {
      drawLine(gridSpacing * x + offsetX, 0, gridSpacing*x + offsetX, height, gridWidth, gridColor);
    }
    for (var y=0; y <= (height / gridSpacing); y++) {
      drawLine(0, gridSpacing*y + offsetY, width, gridSpacing*y + offsetY, gridWidth, gridColor);
    }
  }

  init();
}

module.exports = FloorplannerView