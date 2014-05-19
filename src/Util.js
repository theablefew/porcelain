function Util () {}

Util.prototype.parseAttribute = function(attribute, chart, c) {
  
  var type  = chart.capabilities[c].type;

  return Util.formatType(attribute, type);

};


Util.prototype.formatType = function (value, type) {

  switch(type) {

    case 'boolean': 
      return (value == 'true') ? true : false;
      break;
    case 'int':
      return parseInt(value);
      break;
    case 'float':
      return parseFloat(value);
      break;
    default:
      return value;
  }

};


Util.prototype.extend = function (out) {
  out = out || {};

  for (var i = 1; i < arguments.length; i++) {
    if (!arguments[i])
      continue;

    for (var key in arguments[i]) {
      if (arguments[i].hasOwnProperty(key))
        out[key] = arguments[i][key];
    }
  }

  return out;
};


Util.prototype.extendChart = function (new_chart, orig_chart) {

  new_chart.prototype = Object.create(orig_chart.prototype);
  Object.defineProperties(new_chart.prototype, {
    'constructor': {
      value: new_chart
    },
    '_capabilities': {
      value: (function () { return Util.extend({}, orig_chart.prototype.capabilities)})()
    }
  });

};


Util.prototype.searchPrototypeChain = function (prototype, index) {

  while (typeof prototype == 'object' && prototype != Object.prototype) {
    prototype = Object.getPrototypeOf(prototype);
    if(prototype == index) return true;
  }

  return false;

};


Util.prototype.randomColor = function () {
  return '#'+Math.floor(Math.random()* 16777216).toString(16);
};


Util.prototype.titleCase = function (string) {
  var w = string.split('-')
    , tc = '';
  w.forEach(function (e) {
    tc += e.substr(0, 1).toUpperCase();
    tc += e.substr(1);
  });
  return tc;
};


var Util = new Util();