function PieChart (element) {

  BaseChart.call(this);
  this.element = element;

  this._renderLabelPaths = function () {

    var self = this
      , getCentroid = function (d, r) {
        return d3.svg.arc()
          .outerRadius(self.radius+r)
          .innerRadius(self.radius+r)
          .centroid(d);
      }

    this.chart.selectAll('g.pie-slice')
    .append('path')
    .attr('class', 'pie-callout')
    .attr('d', function (d) {
      // var centroid_outside = getCentroid(d, this.chart.externalLabels()(d)-20)
      var centroid_outside = getCentroid(d, self.offset-25)
        , centroid_inside  = getCentroid(d, 0);

      return d3.svg.line()([centroid_inside, centroid_outside]);
    });
  }

};


Util.extendChart(PieChart, BaseChart);


PieChart.prototype.render = function () {

  var self = this;

  // var offsets = options['offsets'] || {}
  var offsets = {}
    , g_ndx = crossfilter(this.data)
    , g_dim = g_ndx.dimension(function(d) {return d.key;})
    , g_grp = g_dim.group().reduceSum(function(d) {return d.value;});

  this.chart = dc.pieChart(this.element)
    .width(this.size.width)
    .height(this.size.height)
    .radius(this.radius)
    .innerRadius(this.inner_radius)
    .externalLabels(function (d) { return offsets[d.data.key] || self.offset;})
    .minAngleForLabel(0)
    .dimension(g_dim)
    .colors(d3.scale.ordinal().domain(self.theme.domain).range(self.theme.range))
    .group(g_grp);

  this.chart.render();

}


PieChart.prototype.afterRender = function () {
  this._renderLabelPaths();
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
    'offset', {
        property: {
            get        : function ( ) { return this._offset; }
          , set        : function (_) { this._offset = _; }
          , enumerable : true
        }
      , descriptor: {
            defined_in  : PieChart
          , description : 'Measure of how far outside chart to render externalLabels labels'
          , default     : 20
          , required    : false
          , type        : 'int'
        }
    });


Porcelain.register('PieChart', PieChart);