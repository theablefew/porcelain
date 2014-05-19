function VolumeChart (element) {

  BaseChart.call(this);
  this.element = element;

  this._addBarLabels = function () {

    var self = this
      , bar_width = Math.floor((this.chart.xAxisLength() - (this.data.length - 1) * this.gap) / this.data.length);

    this.chart.select('svg ')
      .append('g')
      .attr('class', 'labels')
      .attr('transform', 'translate('+this.margins.left+', '+this.margins.top+')');

    this.chart.select('.labels').selectAll('text')
      .data(this.data)
      .enter()
      .append('text')
        .attr('text-anchor', 'middle')
        .attr('x', function (d) {
          return self.chart.x()(d.key) + (bar_width/2);
        })
        .attr('y', function (d) {
          return self.chart.y()(d.value) - 10;
        })
        .text(function (d) { return self._addCommas(d.value); });
  }


  this._rotateLabel = function () {
    this.chart.select('.axis.x').selectAll('g.tick text')
      .attr('transform', 'rotate('+this.label_rotation+')')
      .style('text-anchor', 'start');
  }

};


Util.extendChart(VolumeChart, BaseChart);


VolumeChart.prototype.render = function () {

  var self = this
    , ndx = crossfilter(this.data)
    , dim = ndx.dimension(function(d) {return d.key;})
    , grp = dim.group().reduceSum(function(d) {return d.value;});

  this.chart = dc.barChart(this.element)
    .dimension(dim)
    .group(grp)
    .width(this.size.width)
    .height(this.size.height)
    .margins(this.margins)
    .centerBar(true)
    .gap(this.gap)
    .colors(d3.scale.ordinal().domain(this.theme.domain).range(this.theme.range))
    .colorAccessor(function (d) { if(self.focus.indexOf(d.key) > -1) return 'bar-focus'; return 'bar-normal'; })
    .x(d3.scale.ordinal().domain(this.data.map(function (b) { return b.key; })))
    .xUnits(dc.units.ordinal)
    .renderHorizontalGridLines(true);

  this.chart.render();

}

VolumeChart.prototype.afterRender = function () {

  this._rotateLabel();
  this._addBarLabels();

}


VolumeChart.prototype.defineCapability(
  'bar_labels', {
      property: {
          get         : function ( ) { return this._bar_labels; }
        , set         : function (_) { this._bar_labels = _; }
        , enumerable  : true
      }
    , descriptor: {
          defined_in  : VolumeChart
        , description : 'Adds value labels to the top of bars'
        , default     : false
        , required    : false
        , type        : 'boolean'
      }
  });


VolumeChart.prototype.defineCapability(
  'focus', {
      property: {
          get         : function ( ) { return this._focus; }
        , set         : function (_) { this._focus = _; }
        , enumerable  : true
      }
    , descriptor: {
          defined_in  : VolumeChart
        , description : 'Highlights data on the chart with an alternate color'
        , default     : []
        , required    : false
        , type        : 'JSON'
      }
  });


VolumeChart.prototype.defineCapability(
    'gap', {
        property: {
            get        : function ( ) { return this._gap; }
          , set        : function (_) { this._gap = _; }
          , enumerable : true
        }
      , descriptor: {
            defined_in  : VolumeChart
          , description : 'Space between bars'
          , default     : 35
          , required    : false
          , type        : 'int'
        }
    });


VolumeChart.prototype.defineCapability(
  'label_rotation', {
      property: {
          get         : function ( ) { return this._label_rotation; }
        , set         : function (_) { this._label_rotation = _; }
        , enumerable  : true
      }
    , descriptor: {
          defined_in  : VolumeChart
        , description : 'Degrees of which to rotate the labels on the x axis'
        , default     : 0
        , required    : false
        , type        : 'int'
      }
  });

Porcelain.register('VolumeChart', VolumeChart);