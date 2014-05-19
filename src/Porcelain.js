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
    chart = this[Util.titleCase(type)](node);

    this.assignChartProperties(node, chart);
    chart.render();
  }

};


Porcelain.prototype.overrideRenderer = function (constructor) {

  var renderer = constructor.prototype.render;

  // delete constructor.prototype.render;

  Object.defineProperties(constructor.prototype, {
    'render': {
      value: function () {

        if(constructor.prototype.hasOwnProperty('beforeRender')) constructor.prototype.beforeRender.call(this);

        this.validate(arguments, function () {
          renderer.apply(this, arguments);
        });

        if(constructor.prototype.hasOwnProperty('afterRender')) constructor.prototype.afterRender.call(this);
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