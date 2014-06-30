function HorizontalBarChart (element) {

  BaseChart.call(this, element);

};


Util.extendChart(HorizontalBarChart, BaseChart);


HorizontalBarChart.prototype.beforeRender = function () {

  var self = this;

  this.labels = this.data.map(function(d) {return d.key;});
  this.layers = d3.layout.stack()(d3.range(this.categories.length).map(function(d) {
    var a = [];
    for (var i = 0; i < self.data.length; ++i) {
      a[i] = {x: i, y: self.data[i][self.categories[d]], layer:d+1, category: self.categories[d] };
    }
    return a;
  }));

  this.yGroupMax = d3.max(this.layers, function(layer) { return d3.max(layer, function(d) { return d.y; }); });
  this.yStackMax = d3.max(this.layers, function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); });

  this.width  = this.size.width - this.margins.left - this.margins.right;
  this.height = this.size.height - this.margins.top - this.margins.bottom;

  this.x = d3.scale.linear().domain([0, this.yStackMax]).range([0, this.width]);
  this.y = d3.scale.ordinal().domain(d3.range(this.data.length)).rangeRoundBands([2, this.height], .3);

  this.color = d3.scale.ordinal().domain(this.categories).range(this._range)

  this.chart = d3.select(this.element).append("svg")
      .attr("width", this.width + this.margins.left )
      .attr("height", this.height + this.margins.top + this.margins.bottom)

  this.chart.append("g")
      .attr("transform", "translate(" + this.margins.left + "," + this.margins.top + ")");


};


HorizontalBarChart.prototype.render = function () {

  var self = this;

  var layer = this.chart.select('g').selectAll(".layer")
      .data(this.layers)
    .enter().append("g")
      .attr("class", "layer")
      .style("fill", function(d, i) { return self.color(self.categories[i]); });

  layer.selectAll("rect")
    .data(function(d) { return d; })
    .enter().append("rect")
    .attr("y", function(d) { return self.y(d.x); })
    .attr("x", function(d) { return self.x(d.y0); })
    .attr("height", this.y.rangeBand())
    .attr("width", function(d) { return self.x(d.y); })
    .attr("class", "split-bar");


  layer.selectAll("text")
    .data(function(d) { return d; })
    .enter().append("text")
    .attr("y", function(d) { return self.y(d.x) + self.y.rangeBand()/2; })
    .attr("x", function(d) { return (self.x(d.y)/2) + self.x(d.y0); })
    .attr("class", "split-bar-label")
    .text(function (d) { return d.category + ' - ' + d.y + '%'; })
    .style("text-anchor", "middle")
    .style('display', function (d) { return ( this.getBoundingClientRect().width < self.x(d.y) - 25 ) ? 'block' : 'none'; })


  var xAxis = d3.svg.axis()
    .tickSize(1)
    .tickFormat(function (d) { return d+"%"; })
    .scale(this.x);

  this.chart.append("g")
    .attr("class", "x axis")
    .attr('transform', 'translate('+this.margins.left+', '+ this.margins.top + this.height+')')
    .call(xAxis);

  var yAxis = d3.svg.axis()
    .scale(this.y)
    .tickSize(1)
    .tickPadding(6)
    .tickFormat(function (d) {return self.labels[d]; })
    .orient("right");

  var ya = this.chart.append("g")
    .attr("class", "y axis")
    .attr('transform', 'translate('+this.margins.left+', 0)')
    .call(yAxis);

 ya.selectAll('.tick').selectAll('text')
    .attr('transform', 'translate(0,'+((this.y.rangeBand() / 3) + this.y.rangeBand() / 3 )+')');


};


HorizontalBarChart.prototype.defineCapability(
    'categories', {
        property: {
            get        : function ( ) { return this._categories; }
          , set        : function (_) { this._categories = _; }
          , enumerable : true
        }
      , descriptor: {
            defined_in  : HorizontalBarChart
          , description : 'Array of keys of the data objects which to plot as segments'
          , default     : []
          , required    : true
          , type        : 'JSON'
        }
    });



Porcelain.register('HorizontalBarChart', HorizontalBarChart);
