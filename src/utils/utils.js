var utils = {};

utils.pointDistanceFromLine  = function( x, y, x1, y1, x2, y2 ) {

  var point = utils.closestPointOnLine(x, y, x1, y1, x2, y2);
	var dx = x - point.x;
	var dy = y - point.y;
	return Math.sqrt(dx * dx + dy * dy);
}

utils.closestPointOnLine = function(x, y, x1, y1, x2, y2) {
  // thanks, http://stackoverflow.com/a/6853926
  var A = x - x1;
  var B = y - y1;
  var C = x2 - x1;
  var D = y2 - y1;

  var dot = A * C + B * D;
  var len_sq = C * C + D * D;
  var param = dot / len_sq;

  var xx, yy;

  if (param < 0 || (x1 == x2 && y1 == y2)) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  return {
    x: xx,
    y: yy
  }
}

utils.distance = function( x1, y1, x2, y2 ) {
	return Math.sqrt(
		Math.pow(x2 - x1, 2) + 
		Math.pow(y2 - y1, 2));
}

// angle between 0,0->x1,y1 and 0,0->x2,y2 (-pi to pi)
utils.angle = function( x1, y1, x2, y2 ) {
    var dot = x1 * x2 + y1 * y2;
    var det = x1 * y2 - y1 * x2;
    var angle = -Math.atan2( det, dot );
    return angle;
}

// shifts angle to be 0 to 2pi
utils.angle2pi = function( x1, y1, x2, y2 ) {
	var theta = utils.angle(x1, y1, x2, y2);
	if (theta < 0) {
		theta += 2*Math.PI;
	}
	return theta;
}

// points is array of points with x,y attributes
utils.isClockwise = function( points ) {
    // make positive
    subX = Math.min(0, Math.min.apply(null, utils.map(points, function(p) {
      return p.x;
    })))
    subY = Math.min(0, Math.min.apply(null, utils.map(points, function(p) {
      return p.x;
    })))
    var newPoints = utils.map(points, function(p) {
      return {
        x: p.x - subX,
        y: p.y - subY
      }
    })

    // determine CW/CCW, based on:
    // http://stackoverflow.com/questions/1165647
    var sum = 0;
    for ( var i = 0; i < newPoints.length; i++ ) {
        var c1 = newPoints[i];
        if (i == newPoints.length-1) {
            var c2 = newPoints[0]
        } else {
            var c2 = newPoints[i+1];
        }
        sum += (c2.x - c1.x) * (c2.y + c1.y);
    }
    return (sum >= 0);
}


utils.guid = (function() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
               .toString(16)
               .substring(1);
  }
  return function() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
           s4() + '-' + s4() + s4() + s4();
  };
})();

// both arguments are arrays of corners with x,y attributes
utils.polygonPolygonIntersect = function(firstCorners, secondCorners) {
    for (var i = 0; i < firstCorners.length; i++) {
        var firstCorner = firstCorners[i],
            secondCorner;
        if (i == firstCorners.length-1) {
            secondCorner = firstCorners[0];
        } else {
            secondCorner = firstCorners[i+1];
        }

        if (utils.linePolygonIntersect(
            firstCorner.x, firstCorner.y,
            secondCorner.x, secondCorner.y,
            secondCorners)) {
            return true;
        }
    }
    return false;
}

// corners is an array of points with x,y attributes
utils.linePolygonIntersect = function(x1,y1,x2,y2,corners) {

    for (var i = 0; i < corners.length; i++) {
        var firstCorner = corners[i],
            secondCorner;
        if (i == corners.length-1) {
            secondCorner = corners[0];
        } else {
            secondCorner = corners[i+1];
        }

        if (utils.lineLineIntersect(x1,y1,x2,y2,
            firstCorner.x, firstCorner.y,
            secondCorner.x, secondCorner.y)) {
            return true;
        }
    }
    return false;
}

utils.lineLineIntersect = function(x1,y1,x2,y2, x3,y3,x4,y4) {
    function CCW(p1, p2, p3) {
        var a = p1.x,
            b = p1.y,
            c = p2.x,
            d = p2.y,
            e = p3.x,
            f = p3.y;
        return (f - b) * (c - a) > (d - b) * (e - a);
    }

    var p1 = {x:x1, y:y1},
        p2 = {x:x2, y:y2},
        p3 = {x:x3, y:y3},
        p4 = {x:x4, y:y4};
    return (CCW(p1, p3, p4) != CCW(p2, p3, p4)) && (CCW(p1, p2, p3) != CCW(p1, p2, p4));
}


// corners is an array of points with x,y attributes
// startX and startY are start coords for raycast
utils.pointInPolygon = function(x,y,corners,startX,startY) {
    startX = startX || 0;
    startY = startY || 0;

    var intersects = 0;
    for (var i = 0; i < corners.length; i++) {
        var firstCorner = corners[i],
            secondCorner;
        if (i == corners.length-1) {
            secondCorner = corners[0];
        } else {
            secondCorner = corners[i+1];
        }

        if (utils.lineLineIntersect(startX,startY,x,y,
            firstCorner.x, firstCorner.y,
            secondCorner.x, secondCorner.y)) {
            intersects++;
        }
    }
    // odd intersections means the point is in the polygon
    //console.log("intersects: " + intersects);

    return ((intersects%2) == 1);
}

// checks if all corners of insideCorners are inside the polygon described by outsideCorners
utils.polygonInsidePolygon = function(insideCorners, outsideCorners, startX, startY) {
    startX = startX || 0;
    startY = startY || 0;

    //console.log("checking polygon in polygon");
    utils.forEach( outsideCorners, function(c) { console.log(c.x + ", " + c.y)});

    for (var i = 0; i < insideCorners.length; i++) {
        //console.log("checking point: " + insideCorners[i].x + ", " + insideCorners[i].y);

        if (!utils.pointInPolygon(
            insideCorners[i].x, insideCorners[i].y,
            outsideCorners,
            startX, startY)) {
            return false;
        }
    }
    return true;
}

// checks if any corners of firstCorners is inside the polygon described by secondCorners
utils.polygonOutsidePolygon = function(insideCorners, outsideCorners, startX, startY) {
    startX = startX || 0;
    startY = startY || 0;

    for (var i = 0; i < insideCorners.length; i++) {
        if (utils.pointInPolygon(
            insideCorners[i].x, insideCorners[i].y,
            outsideCorners,
            startX, startY)) {
            return false;
        }
    }
    return true;
}


// arrays

utils.forEach = function(array, action) {
  for (var i = 0; i < array.length; i++) {
    action(array[i]);
  }
}

utils.forEachIndexed = function(array, action) {
  for (var i = 0; i < array.length; i++) {
    action(i, array[i]);
  }
}

utils.map = function(array, func) {
  var result = [];
  utils.forEach(array, function (element) {
    result.push(func(element));
  });
  return result;
}

// remove elements in array if func(element) returns true
utils.removeIf  = function(array, func) {
  var result = [];
    utils.forEach(array, function (element) {
    if (!func(element)) {
      result.push(element);
    }
  });
  return result;
}

// shift the items in an array by shift (positive integer)
utils.cycle = function(arr, shift) {
  var ret = arr.slice(0);
  for (var i = 0; i < shift; i++) {
    var tmp = ret.shift();
    ret.push(tmp);
  }
  return ret;
}

// returns in the unique elemnts in arr
utils.unique = function(arr, hashFunc) {
  var results = [];
  var map = {};
    for (var i = 0; i < arr.length; i++) {
      if (!map.hasOwnProperty(arr[i])) {
        results.push(arr[i]);
        map[hashFunc(arr[i])] = true;
      }
    }
    return results; 
}

utils.removeValue = function(arr, value) {
  for(var i = arr.length - 1; i >= 0; i--) {
    if(arr[i] === value) {
       arr.splice(i, 1);
    }
  }
}

// checks if value is in array
utils.hasValue = function(array, value) {
  for (var i = 0; i < array.length; i++) {
    if (array[i] === value) {
      return true;
    }
  }
  return false;
}

// subtracts the elements in subArray from array
utils.subtract = function(array, subArray) {
  return utils.removeIf(array, function(el) {
    return utils.hasValue(subArray, el);
  });
}



module.exports = utils;
