function EffScore (element) {

  BaseChart.call(this, element);

  this.addLegendItem = function (type) {
    if(this.data[type].length) {
    var self = this
      , legend_width = function () { return self.legend[0][0].getBoundingClientRect().width; }
      , spacing = 15
      , title = this.data[type][0]["title"]
      , title_trunc = (title.length >30) ? title.substr(0, 27)+'...' : title;

      var item = this.chart.select('.legend')
        .append('text')
        .attr('x', legend_width() + spacing)
        .text(title_trunc);

      this.chart.select('.legend')
        .append('circle')
        .attr('class', type)
        .attr('r', 7)
        .attr('cx', legend_width() + 7)
        .attr('cy', '-7');

      document.querySelector('#mobile-legend').innerHTML += '<br /><span>'+title+'</span><span class="icon '+type+'">•</span>';

      this.legend.attr('transform', 'translate('+parseInt(this.width - legend_width() + this.margins.right )+', '+parseInt(this.height+this.margins.top+40)+')');
    }
  };

  this.drawLines = function (type) {
    this.chart.select('g.'+type).insert('path', 'circle.point')
      .attr('d', this.line(this.data[type].filter(this.nullScore)))
      .attr('class', 'line '+type);
  };

  this.drawPoints = function (type) {
    this.chart.append('g')
        .attr('class', type)
      .selectAll('circle.'+ type)
      .data(this.data[type].filter(this.nullScore))
      .enter()
      .append('circle')
        .attr('class', 'point ' + type);

    if(this.data[type].length) { 
      this.drawLines(type);
      this.addLegendItem(type);
    }
  };

  this.nullScore = function (_) {
    return _.score !== null;
  };

}


Util.extendChart(EffScore, BaseChart);


EffScore.prototype.beforeRender = function () {

  var self = this;

  this.device_width = document.getElementsByTagName('body')[0].getBoundingClientRect().width;
  if(this.device_width <= 768) this.margins.bottom = 20;

  this.width = Math.min(this.device_width - 20, this.size.width) - this.margins.left - this.margins.right;
  this.height = this.size.height - this.margins.top - this.margins.bottom;

  this.lines = Object.keys(this.data);

  this.count_extent = d3.extent(this.lines.reduce(function (p, v) { return p.concat(self.data[v]); }, []), function (d) { return d.score; });
  this.count_scale = d3.scale.linear().domain(this.count_extent).range([this.height, 0]);
  this.count_axis = d3.svg.axis()
    .scale(this.count_scale)
    .orient('right')
    .tickFormat(function(d, i) {
      return d3.format('0,000.00')(d/1000) + ' k';
    });

  this.time_extent = (this.type == 'movietracker') ? d3.extent(this.lines.reduce(function (p, v) { return p.concat(self.data[v]); }, []), function (d) { return d.time; }) : [-8, 0];
  this.time_scale = d3.scale.linear().domain(this.time_extent).range([0, this.width]);
  this.time_axis = d3.svg.axis()
    .scale(this.time_scale)
    .ticks(8)
    .tickFormat(function (d, i) {
      // if(d == 2) return '';
      if(d > 0) return (self.device_width <= 768 ) ? 'WK ' + d : 'WEEK' + d;
      if( d == 0) {
        if (self.type == 'movietracker') {
         return (self.device_width <= 768) ? 'NP' : 'NOW PLAYING';
       } else {
        return '';
       } 
      }
      if (d == -1) return (self.device_width <= 768 ) ? Math.abs(d) + ' WK' : Math.abs(d) + ' WEEK';
      return (self.device_width <= 768) ? Math.abs(d) + ' WKs' : Math.abs(d) + ' WEEKS';
    });

  this.xAxis = d3.svg.axis()
    .scale(this.time_scale)
    .orient("bottom")
    .ticks(8);

  this.yAxis = d3.svg.axis()
    .scale(this.count_scale)
    .orient("right")
    .ticks(7);

  this.line = d3.svg.line()
    .x(function (d){return self.time_scale(d.time)})
    .y(function (d){return self.count_scale(d.score)});

  this.area = d3.svg.area()
    .x(function(d) { return self.time_scale(d.time); })
    .y0(this.height)
    .y1(function(d) { return self.count_scale(d.score); });

  this.chart = d3.select(this.element)
    .append('svg')
      .attr('class', 'effscore')
      .attr('width' , this.width + this.margins.left + this.margins.right)
      .attr('height', this.height + this.margins.top + this.margins.bottom + 55)
    .append('g')
      .attr('class', 'chart')
      .attr('transform', 'translate(' + this.margins.left + ',' + this.margins.top + ')');

  this.area_data = [];
  for(var d in this.data.primary) {
    if(this.data.primary[d].score != null) {
      this.area_data.push(this.data.primary[d]);
    }
  }

  this.legend = this.chart.append('g')
    .attr('class', 'legend');

};


EffScore.prototype.render = function () {

  var self = this;

  this.chart.append("g")
    .attr("class", "grid x")
    .attr("transform", "translate(0," + this.height + ")")
    .call(this.xAxis
      .tickSize(-this.height, 0, 0)
      .tickFormat(''));

  this.chart.append("g")
    .attr("class", "grid y")
    .call(this.yAxis
      .tickSize(this.width, 0, 0)
      .tickFormat(''));

  this.chart.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + this.height + ')')
    .call(this.time_axis);

  this.chart.append('g')
    .attr('class', 'y axis')
    .attr('transform', 'translate(' + this.width + ', 0)')
    .call(this.count_axis);

  this.chart.append("path")
    .datum(this.area_data)
    .attr("class", "area")
    .attr("d", this.area);

  document.querySelector('#mobile-legend').innerHTML = "<span class='title'></span>";

  this.legend.append('text')
    .text('Legend:')
    .attr('class', 'title');

  this.lines.forEach(function (d) {
    self.drawPoints(d);
  });

  d3.selectAll('circle.point')
    .attr('cy', function (d) { return self.count_scale(d.score);})
    .attr('cx', function (d) { return self.time_scale(d.time); })
    .attr('r', 7);

  d3.selectAll('.x.axis .tick.major text')
    .attr('x', 10)
    .attr('style', 'text-anchor:start');

};


EffScore.prototype.defineCapability(
    'type', {
        property: {
            get        : function ( ) { return this._type; }
          , set        : function (_) { this._type = _; }
          , enumerable : true
        }
      , descriptor: {
            defined_in  : EffScore
          , description : 'Specific type of chart'
          , default     : 'movietracker'
          , required    : false
          , type        : 'string'
        }
    });


Porcelain.register('EffScore', EffScore);


/*var resize_to = null;

window.addEventListener('resize', function (e) {
  clearTimeout(resize_to);
  resize_to = setTimeout(function() {
  document.querySelector('#foo').innerHTML = '';
  p.render();
  }, 500);
});*/