function HorizontalBarChart (element) {

  BaseChart.call(this);
  this.element = element;

};


Util.extendChart(HorizontalBarChart, BaseChart);


HorizontalBarChart.prototype.render = function () {

  var self = this
    , n       = this.categories.length
    , m       = this.data.length
    , stack   = d3.layout.stack()
    , labels  = this.data.map(function(d) {return d.key;})
    , layers  = stack(d3.range(n).map(function(d) {
        var a = [];
        for (var i = 0; i < m; ++i) {
          a[i] = {x: i, y: self.data[i][self.categories[d]], layer:d+1};
        }
        return a;
       }))
    , yGroupMax = d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d.y; }); })
    , yStackMax = d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); })
    , width  = this.size.width - this.margins.left - this.margins.right
    , height = this.size.height - this.margins.top - this.margins.bottom;

  var x = d3.scale.linear()
        .domain([0, yStackMax])
        .range([0, width])
    , y = d3.scale.ordinal()
        .domain(d3.range(m))
        .rangeRoundBands([2, height], .3)
    , color = d3.scale.ordinal()
        .domain(this.categories)
        .range(this.theme.range)
    , chart = d3.select(this.element);

  this.chart = chart.append("svg")
      .attr("width", width + this.margins.left + this.margins.right)
      .attr("height", height + this.margins.top + this.margins.bottom)
    .append("g")
      .attr("transform", "translate(" + this.margins.left + "," + this.margins.top + ")");

  var layer = this.chart.selectAll(".layer")
      .data(layers)
    .enter().append("g")
      .attr("class", "layer")
      .style("fill", function(d, i) { return color(self.categories[i]); });

  layer.selectAll("rect")
    .data(function(d) { return d; })
    .enter().append("rect")
    .attr("y", function(d) { return y(d.x); })
    .attr("x", function(d) { return x(d.y0); })
    .attr("height", y.rangeBand())
    .attr("width", function(d) { return x(d.y); })
    .attr("class", "split-bar");

  var xAxis = d3.svg.axis()
    .tickSize(1)
    .tickFormat(function (d) { return d+"%"; })
    .scale(x);

  this.chart.append("g")
    .attr("class", "x axis")
    .attr('transform', 'translate(0, '+height+')')        
    .call(xAxis);

  var yAxis = d3.svg.axis()
    .scale(y)
    .tickSize(1)
    .tickPadding(6)
    .tickFormat(function (d) {return labels[d]; })
    .orient("left");

  this.chart.append("g")
    .attr("class", "y axis")
    .call(yAxis);

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