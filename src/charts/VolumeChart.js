function VolumeChart (element) {

  BarChart.call(this);
  this.element = element;

  this._colorAccessor = function (d) {
    if(this.focus.indexOf(d.key) > -1) return 'bar-focus'; return 'bar-normal';
  };

};


Util.extendChart(VolumeChart, BarChart);


VolumeChart.prototype.render = function () {
  BarChart.prototype.render.call(this);
}

VolumeChart.prototype.afterRender = function () {

  var self = this;
  this.chart.selectAll(".bar")
    .style("fill", function (d) { return self.color(self._colorAccessor(d));  });

};


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


Porcelain.register('VolumeChart', VolumeChart);
