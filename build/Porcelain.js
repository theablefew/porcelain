var Porcelain = function () {

  this._chart_selector = '.porcelain-chartable';

  this._chart_types = {};
  this._charts      = [];

  this.init();

};


Porcelain.prototype.init = function () {

  this.constructDOMCharts();

};


Porcelain.prototype.addChart = function (chart, node, type) {

  this._charts.push({
      chart   : chart
    , node    : node
    , type    : type
  });

  return this._charts.length;

}


Porcelain.prototype.addChartToRegistry = function (type, constructor) {

  if(!Util.searchPrototypeChain(constructor.prototype, BaseChart.prototype)) throw "Chart: '"+type+"' must inherit from BaseChart";
  if(!constructor.prototype.hasOwnProperty('render')) throw "Chart: '"+type+"' must implement a 'render' method";
  if(this._chart_types[type]) throw "Chart '"+type+"' already defined. Skipping ...";


  var chart;

  this.overrideRenderer(constructor);

  this._chart_types[type] = constructor;
  Object.defineProperty(this, type, {
    get: function ( ) { return function (node) {
      chart = new constructor(node);
      this.addChart(chart, node, type);
      return  chart;
    }}
  });
  
};


Porcelain.prototype.assignChartProperties = function (node, chart) {

  var attribute
    , capabilities;

  if(node.getAttribute('data-capabilities')) {
    capabilities = JSON.parse(node.getAttribute('data-capabilities'));
    for(var c in capabilities) {
      if(chart.capabilities[c]) chart[c] = capabilities[c];
    }
  }

  for(var c in chart.capabilities) {
    attribute = node.getAttribute('data-'+c.replace('_', '-'));

    if(attribute) chart[c] = Util.parseAttribute(attribute, chart, c);

  }

};


Porcelain.prototype.constructDOMCharts = function () {

  var node_list = document.querySelectorAll(this._chart_selector)
    , node
    , type
    , chart;

  for( var i = 0; i < node_list.length; i++) {
    node = node_list[i];
    type = node.getAttribute('data-chart-type');
    try {
      chart = this[Util.titleCase(type)](node);
    } catch (err) {
      console.warn('Chart type: "'+type+'" not found. Skipping render');
      return;
    }

    this.assignChartProperties(node, chart);
    chart.render();
  }

};


Porcelain.prototype.overrideRenderer = function (constructor) {

  var renderer = constructor.prototype.render;

  Object.defineProperties(constructor.prototype, {
    'render': {
      value: function () {

        if(constructor.prototype.hasOwnProperty('beforeRender')) constructor.prototype.beforeRender.call(this);

        this.validate(arguments, function () {
          renderer.apply(this, arguments);
          if(constructor.prototype.hasOwnProperty('afterRender')) constructor.prototype.afterRender.call(this);
        });
      }
    }
  })

};


Porcelain.prototype.register = function (type, constructor) {

  try         { this.addChartToRegistry(type, constructor); }
  catch (err) { console.warn(err); }

};


Object.defineProperties(Porcelain.prototype, {

    'charts': {
      get: function () { return this._charts; }
    }
  , 'types': {
      get: function () { return this._chart_types; }
  }

});


window.Porcelain = new Porcelain();


document.addEventListener('DOMContentLoaded', function () {
  Porcelain.init();
});

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
    case 'JSON': 
      return JSON.parse(value);
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

Util = new Util();

function BaseChart (element) {

  this._addCommas = function (str)
  {
    str += '';
    x = str.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
      x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
  }

};


Object.defineProperties(BaseChart.prototype, {
    validate: {
      value: function (render_args, render) {
        var self = this
          , valid = true;

        Object.keys(this.capabilities).forEach(function (c) {
          if (self.capabilities[c].required) {
            if(!self[c]) {
              valid = false;
              console.warn('Required capability "'+c+'" not set, skipping render');
            }
          }
        });

        if(valid) render.apply(this, render_args);
      }
    }
  , _capabilities: {
        writable: true
      , value   : {}
  }
  , capabilities: {
      get: function () { return this._capabilities; }
  }
  , chart: {
        get        : function ( ) { return this._chart; }
      , set        : function (_) { this._chart = _; }
      , enumerable : false
  }
  , defineCapability: {
      value: function (capability, definition) {
        var prototype = definition.descriptor.defined_in.prototype;
        prototype._capabilities[capability] = definition.descriptor;
        Object.defineProperty(prototype, '_'+capability, {
            writable  : true
          , enumerable : false
          , value      : definition.descriptor.default
        });
        Object.defineProperty(prototype, capability, definition.property); 
      }
  }
});



BaseChart.prototype.defineCapability(
  'data', {
      property: {
          get        : function ( ) { return this._data; }
        , set        : function (_) { this._data = (typeof _ == 'string') ? JSON.parse(_) : _; }
        , enumerable : true
      }
    , descriptor: {
          defined_in  : BaseChart
        , description : 'Data passed into the chart'
        , required    : true
        , type        : 'JSON'
      }
  });


BaseChart.prototype.defineCapability(
  'element', {
      property: {
          get        : function ( ) { return this._element; }
        , set        : function (_) { this._element = (typeof _ == 'string') ? document.querySelectorAll(_)[0] : _; }
        , enumerable : true
      }
    , descriptor: {
          defined_in  : BaseChart
        , description : 'Element into which to draw the chart. The element passed is either a selector string or a DOM element reference'
        , required    : true
        , type        : 'string|element'
      }
  });


BaseChart.prototype.defineCapability(
  'margins', {
      property: {
          get: function ( ) { return this._margins; }
        , set: function (_) { this._margins = _; }
        , enumerable: true
      }
    , descriptor: {
          defined_in  : BaseChart
        , description : 'Sets the margins between the chart and the containing dom element. Accepts a object with "top", "right", "bottom" and "left" properties.'
        , default     : {top: 30, right: 30, bottom: 30, left: 30}
        , required    : true
        , type        : 'JSON'
      }
  });


BaseChart.prototype.defineCapability(
  'size', {
      property: {
          get        : function ( ) { return this._size; }
        , set        : function (_) { this._size = (_ == 'auto') ? {width: _el.offsetWidth, height: _el.offsetHeight} : _; }
        , enumerable : true
      }
    , descriptor: {
          defined_in  : BaseChart
        , description : 'Sets the width and height of the chart. Accepts a object with "width" and "height" properties or a string "auto", which sets dimensions to that of the prentent element.'
        , default     : {width: 400, height: 400}
        , required    : true
        , type        : 'JSON'
      }
  });


BaseChart.prototype.defineCapability(
  'theme', {
      property: {
          get        : function ( ) { return this._theme; }
        , set        : function (_) { 
          this._theme = {domain: [], range: [], name: _}
          for(var i in _) {
            this._theme.domain.push(i);
            this._theme.range.push(_[i]);
          }
        }
        , enumerable : true
      }
    , descriptor: {
          defined_in  : BaseChart
        , description : 'Color-set for charted data.'
        , default     : {domain: [], range: [Util.randomColor(), Util.randomColor(), Util.randomColor(), Util.randomColor()], name: {}}
        , required    : false
        , type        : 'JSON'
      }
  });
