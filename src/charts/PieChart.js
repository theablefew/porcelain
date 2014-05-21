function PieChart (element) {

  BaseChart.call(this);
  this.element = element;

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
    .attr('d', function (d) {
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