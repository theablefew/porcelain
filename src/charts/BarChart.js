function BarChart (element) {

  BaseChart.call(this);
  this.element = element;

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

}


Util.extendChart(BarChart, BaseChart);


BarChart.prototype.beforeRender = function () {

  this.x.domain(this.data.map(function(d) { return d.key; }));
  this.y.domain([0, d3.max(this.data, function(d) { return d.value; })]);

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

  this.chart.selectAll(".bar")
      .data(this.data)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return self.x(d.key); })
      .attr("y", function(d) { return self.y(d.value); })
      .attr("height", function(d) { return self.height - self.y(d.value); })
      .attr("width", this.x.rangeBand());

};

BarChart.prototype.afterRender = function () {

  var self = this;

  if(this.labels) {
    this.chart.append("g")
        .attr("class", "labels")
      .selectAll('.label')
      .data(this.data)
      .enter().append("text")
        .text(function (d) { return d.value; })
          .attr("x", function(d) { return self.x(d.key)+self.x.rangeBand()/2; })
          .attr("y", function(d) { return self.y(d.value)-5; });
  }

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


Porcelain.register('BarChart', BarChart);