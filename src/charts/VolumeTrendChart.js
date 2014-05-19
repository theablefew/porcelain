function VolumeTrendChart (element) {

  VolumeChart.call(this);
  this.element = element;

}


Util.extendChart(VolumeTrendChart, VolumeChart);


VolumeTrendChart.prototype.render = function () {

  var self = this
    , ndx = crossfilter(this.data)
    , dim = ndx.dimension(function(d) {return d.date;})
    , grp = dim.group().reduceSum(function(d) {return d.value});

  this.chart = dc.compositeChart(this.element)
    .width(this.size.width)
    .height(this.size.height)
    .x(d3.scale.ordinal().domain(this.data.map(function (b) { return b.date; })))
    .xUnits(dc.units.ordinal)
    .renderHorizontalGridLines(true)
    .margins(this.margins)
    .compose([
      dc.lineChart(this.chart)
        .dimension(dim)
        .group(grp)
        .colors(this.theme.name['trend-line']),
      dc.barChart(this.chart)
        .dimension(dim)
        .group(grp)
        .gap(this.gap)
        .colors(d3.scale.ordinal().domain(this.theme.domain).range(this.theme.range))
        .colorAccessor(function (d) { if(self.focus.indexOf(d.key) > -1) return 'bar-focus'; return 'bar-normal'; })
        .centerBar(false)
    ])

  this.chart.yAxis().ticks(4);
  this.chart.render();

}


VolumeTrendChart.prototype.afterRender = function () {

  this.chart.select('.sub._0').attr('transform', 'translate('+this.gap+', 0)');
  this._rotateLabel();

}


Porcelain.register('VolumeTrendChart', VolumeTrendChart);