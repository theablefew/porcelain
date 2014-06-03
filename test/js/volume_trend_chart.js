function VolumeTrendChart (element) {

  VolumeChart.call(this, element);

}


Util.extendChart(VolumeTrendChart, VolumeChart);


VolumeTrendChart.prototype.render = function () {

  var self = this;

  VolumeChart.prototype.render.call(this);

  var path = d3.svg.line()
    .x(function (d) { return self.x(d.key); })
    .y(function (d) { return self.y(d.value); });

  this.chart.append("g")
      .attr("class", "trend-line")
      .attr("transform", "translate("+self.x.rangeBand()/2+", 0)")
    .append("path")
      .datum(this.data)
      .attr("d", path);

};


Porcelain.register('VolumeTrendChart', VolumeTrendChart);