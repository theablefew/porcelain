function PieChart (element) {

  BaseChart.call(this, element);

  this.count = -1;

  this._getCentroid = function (d, r) {

    return d3.svg.arc()
      .outerRadius(this.radius+r)
      .innerRadius((this.label_offset > 0) ? this.radius + r : this.inner_radius)
      .centroid(d);
  };

  this._getMultiplier = function (d, i) {

    if((d.endAngle - d.startAngle) < (Math.PI/180)*10 ) {this.count++; return this.offset_padding*(this.count);}
    else { return 0;}

  }

}


Util.extendChart(PieChart, BaseChart);


PieChart.prototype.beforeRender = function () {
  this.data.sort(function (a, b) { return d3.descending(a.value, b.value);});
}


PieChart.prototype.render = function () {

  var self = this
    , padding = 10;

  var arc = d3.svg.arc()
      .outerRadius(this.radius)
      .innerRadius(this.inner_radius);

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
      .attr("transform", function(d, i) {
        var centroid_outside = self._getCentroid(d, self.label_offset + self._getMultiplier(d, i))
        return "translate(" + centroid_outside + ")"; })
      .attr("dy", ".35em")
      .style("text-anchor", "middle")
      .text(function(d) { return d.data.key; });

  g.append('path')
    .attr('class', 'pie-callout')
    .attr('d', function (d, i) {
      // var centroid_outside = self._getCentroid(d, self.label_offset-self.offset_padding + self._getMultiplier(d, i))
      var centroid_outside = self._getCentroid(d, self.label_offset-padding)
        , centroid_inside  = self._getCentroid(d, padding, i);
      if(self.label_offset > 0 ) return d3.svg.line()([centroid_inside, centroid_outside]);
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


PieChart.prototype.defineCapability(
    'offset_padding', {
        property: {
            get        : function ( ) { return this._offset_padding; }
          , set        : function (_) { this._offset_padding = _; }
          , enumerable : true
        }
      , descriptor: {
            defined_in  : PieChart
          , description : 'Padding between line and label'
          , default     : 15
          , required    : false
          , type        : 'int'
        }
    });


Porcelain.register('PieChart', PieChart);