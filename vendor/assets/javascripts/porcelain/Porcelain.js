var Porcelain = function () {

  this._chart_selector = 'porcelain-chartable';
  this._chart_class    = 'porcelain-chart';

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

  this.addClass(chart.element, this._chart_class);
  this.addClass(chart.element, type);

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

Porcelain.prototype.addClass = function (node, class_name) {

  if (node.classList) node.classList.add(class_name);
  else node.className += ' ' + class_name;

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

  var node_list = document.querySelectorAll('.'+this._chart_selector)
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

  this.element = element;

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

function BarChart (element) {

  BaseChart.call(this, element);

  this._addBarLabels = function () {

    var self = this;

    this.chart.append("g")
        .attr("class", "labels")
      .selectAll('.label')
      .data(this.data)
      .enter().append("text")
        .text(function (d) { return d.value; })
          .attr("x", function(d) { return self.x(d.key)+self.x.rangeBand()/2; })
          .attr("y", function(d) { return self.y(d.value)-5; })
          .style('text-anchor', 'middle');
  };

  this._rotateLabel = function () {
    this.chart.select('.axis.x').selectAll('g.tick text')
      .attr('transform', 'rotate('+this.label_rotation+')')
      .style('text-anchor', 'start');
  };

}


Util.extendChart(BarChart, BaseChart);


BarChart.prototype.beforeRender = function () {

  this.width = this.size.width - this.margins.left - this.margins.right;
  this.height = this.size.height - this.margins.top - this.margins.bottom;

  this.x = d3.scale.ordinal().rangeRoundBands([0, this.width], .1);
  this.y = d3.scale.linear().range([this.height, 0]);

  this.xAxis = d3.svg.axis().scale(this.x).orient("bottom");
  this.yAxis = d3.svg.axis().scale(this.y).orient("left");

  this.chart = d3.select(this.element).append("svg")
      .attr("width", this.width + this.margins.left + this.margins.right)
      .attr("height", this.height + this.margins.top + this.margins.bottom)
    .append("g")
      .attr("transform", "translate(" + this.margins.left + "," + this.margins.top + ")");

  this.x.domain(this.data.map(function(d) { return d.key; }));
  this.y.domain([0, d3.max(this.data, function(d) { return d.value; })]);

  this.color = d3.scale.ordinal()
    .domain(this.theme.domain)
    .range(this.theme.range);

}


BarChart.prototype.render = function () {

  var self = this;

  this.chart.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + this.height + ")")
    .call(this.xAxis);

  this.chart.append("g")
    .attr("class", "y axis")
    .call(this.yAxis);

  this.chart.append("g")
      .attr("class", "bars")
    .selectAll(".bar")
      .data(this.data)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return self.x(d.key); })
      .attr("y", function(d) { return self.y(d.value); })
      .attr("height", function(d) { return self.height - self.y(d.value); })
      .attr("width", this.x.rangeBand())
      .style("fill", function(d) { return self.color(d.key); });

};

BarChart.prototype.afterRender = function () {

  if(this.labels) this._addBarLabels();
  this._rotateLabel();

};


BarChart.prototype.defineCapability(
    'labels', {
        property: {
            get        : function ( ) { return this._labels; }
          , set        : function (_) { this._labels = _; }
          , enumerable : true
        }
      , descriptor: {
            defined_in  : BarChart
          , description : 'Data labels at the top of each bar'
          , default     : false
          , required    : false
          , type        : 'boolean'
        }
    });


BarChart.prototype.defineCapability(
  'label_rotation', {
      property: {
          get         : function ( ) { return this._label_rotation; }
        , set         : function (_) { this._label_rotation = _; }
        , enumerable  : true
      }
    , descriptor: {
          defined_in  : BarChart
        , description : 'Degrees of which to rotate the labels on the x axis'
        , default     : 0
        , required    : false
        , type        : 'int'
      }
  });


Porcelain.register('BarChart', BarChart);
function HorizontalBarChart (element) {

  BaseChart.call(this, element);

};


Util.extendChart(HorizontalBarChart, BaseChart);


HorizontalBarChart.prototype.beforeRender = function () {

  var self = this;

  this.labels = this.data.map(function(d) {return d.key;});
  this.layers = d3.layout.stack()(d3.range(this.categories.length).map(function(d) {
    var a = [];
    for (var i = 0; i < self.data.length; ++i) {
      a[i] = {x: i, y: self.data[i][self.categories[d]], layer:d+1};
    }
    return a;
  }));

  this.yGroupMax = d3.max(this.layers, function(layer) { return d3.max(layer, function(d) { return d.y; }); });
  this.yStackMax = d3.max(this.layers, function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); });
  
  this.width  = this.size.width - this.margins.left - this.margins.right;
  this.height = this.size.height - this.margins.top - this.margins.bottom;

  this.x = d3.scale.linear().domain([0, this.yStackMax]).range([0, this.width]);
  this.y = d3.scale.ordinal().domain(d3.range(this.data.length)).rangeRoundBands([2, this.height], .3);

  this.color = d3.scale.ordinal().domain(this.categories).range(this.theme.range)

  this.chart = d3.select(this.element).append("svg")
      .attr("width", this.width + this.margins.left + this.margins.right)
      .attr("height", this.height + this.margins.top + this.margins.bottom)
    .append("g")
      .attr("transform", "translate(" + this.margins.left + "," + this.margins.top + ")");


};


HorizontalBarChart.prototype.render = function () {

  var self = this;

  var layer = this.chart.selectAll(".layer")
      .data(this.layers)
    .enter().append("g")
      .attr("class", "layer")
      .style("fill", function(d, i) { return self.color(self.categories[i]); });

  layer.selectAll("rect")
    .data(function(d) { return d; })
    .enter().append("rect")
    .attr("y", function(d) { return self.y(d.x); })
    .attr("x", function(d) { return self.x(d.y0); })
    .attr("height", this.y.rangeBand())
    .attr("width", function(d) { return self.x(d.y); })
    .attr("class", "split-bar");

  var xAxis = d3.svg.axis()
    .tickSize(1)
    .tickFormat(function (d) { return d+"%"; })
    .scale(this.x);

  this.chart.append("g")
    .attr("class", "x axis")
    .attr('transform', 'translate(0, '+this.height+')')        
    .call(xAxis);

  var yAxis = d3.svg.axis()
    .scale(this.y)
    .tickSize(1)
    .tickPadding(6)
    .tickFormat(function (d) {return self.labels[d]; })
    .orient("left");

  this.chart.append("g")
    .attr("class", "y axis")
    .call(yAxis);

};


HorizontalBarChart.prototype.defineCapability(
    'categories', {
        property: {
            get        : function ( ) { return this._categories; }
          , set        : function (_) { this._categories = _; }
          , enumerable : true
        }
      , descriptor: {
            defined_in  : HorizontalBarChart
          , description : 'Array of keys of the data objects which to plot as segments'
          , default     : []
          , required    : true
          , type        : 'JSON'
        }
    });



Porcelain.register('HorizontalBarChart', HorizontalBarChart);
function PieChart (element) {

  BaseChart.call(this, element);

  this._getCentroid = function (d, r) {
    return d3.svg.arc()
      .outerRadius(this.radius+r)
      .innerRadius(this.radius+r)
      .centroid(d);
  };

}


Util.extendChart(PieChart, BaseChart);


PieChart.prototype.beforeRender = function () {
  this.data.sort(function (a, b) { return d3.ascending(a.value, b.value);});
}


PieChart.prototype.render = function () {

  var self = this
    , offset_padding = 10;

  var arc = d3.svg.arc()
      .outerRadius(this.radius)
      .innerRadius(this.inner_radius);

  var arc_label = d3.svg.arc()
      .outerRadius(this.radius + this.label_offset*2)
      .innerRadius((this.label_offset > 0) ? this.radius : this.inner_radius);

  var color = d3.scale.ordinal()
      .domain(this.theme.domain)
      .range(this.theme.range);

  var pie = d3.layout.pie()
      .sort(null)
      .value(function(d) { return d.value; });

  this.chart = d3.select(this.element).append("svg")
      .attr("width", this.size.width)
      .attr("height", this.size.height)
    .append("g")
      .attr("transform", "translate(" + this.size.width / 2 + "," + this.size.height / 2 + ")");

  var g = this.chart.selectAll(".pie-slice")
      .data(pie(this.data))
    .enter().append("g")
      .attr("class", "pie-slice");

  g.append("path")
      .attr("d", arc)
      .style("fill", function(d) { return color(d.data.key); });

  g.append("text")
      .attr("transform", function(d) {
        return "translate(" + arc_label.centroid(d) + ")"; })
      .attr("dy", ".35em")
      .style("text-anchor", "middle")
      .text(function(d) { return d.data.key; });

  g.append('path')
    .attr('class', 'pie-callout')
    .attr('d', function (d, i) {
      var centroid_outside = self._getCentroid(d, self.label_offset-offset_padding)
        , centroid_inside  = self._getCentroid(d, offset_padding);

      return d3.svg.line()([centroid_inside, centroid_outside]);
    });

}


PieChart.prototype.defineCapability(
    'radius', {
        property: {
            get        : function ( ) { return this._radius; }
          , set        : function (_) { this._radius = _; }
          , enumerable : true
        }
      , descriptor: {
            defined_in  : PieChart
          , description : 'Outsize radius of the pie chart'
          , default     : 100
          , required    : false
          , type        : 'int'
        }
    });

PieChart.prototype.defineCapability(
    'inner_radius', {
        property: {
            get        : function ( ) { return this._inner_radius; }
          , set        : function (_) { this._inner_radius = _; }
          , enumerable : true
        }
      , descriptor: {
            defined_in  : PieChart
          , description : 'Inside radius of the chart'
          , default     : 0
          , required    : false
          , type        : 'int'
        }
    });


PieChart.prototype.defineCapability(
    'label_offset', {
        property: {
            get        : function ( ) { return this._label_offset; }
          , set        : function (_) { this._label_offset = _; }
          , enumerable : true
        }
      , descriptor: {
            defined_in  : PieChart
          , description : 'Measure of how far outside chart to render externalLabels labels'
          , default     : 0
          , required    : false
          , type        : 'int'
        }
    });


Porcelain.register('PieChart', PieChart);