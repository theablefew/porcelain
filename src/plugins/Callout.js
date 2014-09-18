function Callout (chart, options) {

  var keyFormatter   = function (d) { return d[options.keyAccessor || "key"];   }
    , valueFormatter = function (d) { return d[options.valueAccessor || "value"]; }
    // , valueFormatter = options.valueFormatter || function (d) { return d.value; }
    , pointer_timeout
    , self = this;

  chart.element.addEventListener('afterRender', function (e) {
    if(Object.getPrototypeOf(chart) == e.detail) self.enablePointer(chart, options.selector, keyFormatter, valueFormatter);
  })

}

Callout.prototype.drawPointer = function (chart, x, y, text, val) {

  text = Util.titleCase(text);
  var w = 70
    , h = 45
    , padding = 10
    , font_size = 11
    , callout = d3.select(chart.element).select('svg').append('g')
        .attr('class', 'callout')
        .style("opacity",0)
    , pointer = callout.append('rect')
        .attr('class', 'pointer')
        .attr('height', h)
    , title = callout.append('text')
        .attr('class', 'callout-title')
        .text(text)
        .attr('x', padding)
    , w = Math.max(title[0][0].getBoundingClientRect().width + padding * 2, w)
    , x_offset = (x <= chart.size.width/2) ? 0 : w 
    , y_offset = (y <= chart.size.height/2) ? 2*h : 0
    , points = w/2-padding+','+h+' '+
        + parseInt(x_offset)+','+ parseInt(0-y_offset + h*2) +' '
        + parseInt(w/2+padding)+','+h
    , formatted_value = (chart.formatter !== undefined) ? d3.format(chart.formatter)(val) : val;

  pointer.attr('width', w)
    .attr('x', 0)
    .attr('y', y_offset/2)

  callout.append('polygon')
  .attr('points', points);

  title.attr('y', font_size + padding + y_offset/2);

  callout.append('text')
    .text(formatted_value)
    .attr('x', padding)
    .attr('y', (font_size * 2) + padding + 2 + y_offset/2);

  callout.attr('transform', 'translate(' + parseInt((x - x_offset)) + ', ' + parseInt(y - (0-y_offset + h*2) ) + ')')
    .transition()
    .duration(75)
    .ease("exp")
    .style("opacity",1);

};


Callout.prototype.removePointer = function () {

  d3.selectAll('.callout')
    .transition()
    .duration(75)
    .ease("exp")
    .style("opacity",0)
    .remove();

};


Callout.prototype.enablePointer = function (chart, selector, keyFormatter, valueFormatter) {

  var self = this;

  chart.chart.selectAll(selector)
    .each(function (d){
      this.addEventListener('mouseover', function (e) {
        self.pointer_timeout = setTimeout(function () {
          self.drawPointer(chart, e.offsetX, e.offsetY, keyFormatter(d), valueFormatter(d));
        }, 100);
      });
      this.addEventListener('mouseout', function () {
        clearTimeout(self.pointer_timeout);
        self.removePointer();
      })
    });
};


Porcelain.registerPlugin('Callout', Callout);
