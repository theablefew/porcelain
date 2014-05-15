function PieChart (element) {

  BaseChart.call(this);
  this.element = element;

};


extendChart(PieChart, BaseChart);


PieChart.prototype.render = function () {

  var pie = dc.pieChart(this.element)
        , g_ndx = crossfilter(this.data)
        , g_dim = g_ndx.dimension(function(d) { return d.key;})
        , g_grp = g_dim.group().reduceSum(function(d) {return d.value;});

      pie
        .dimension(g_dim)
        .group(g_grp)
        .width(this.size.width)
        .height(this.size.height)
        .radius(this.radius)
        .innerRadius(this.inner_radius);

      pie.render();
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
          , required    : false // todo: enforce requirements
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
          , required    : false // todo: enforce requirements
          , type        : 'int'
        }
    });


Porcelain.register('PieChart', PieChart);