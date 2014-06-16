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
    .domain(this._domain)
    .range(this._range);

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
        , type        : 'number'
      }
  });


Porcelain.register('BarChart', BarChart);
