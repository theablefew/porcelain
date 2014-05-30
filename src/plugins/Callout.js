function Callout () {

}

Callout.prototype.drawPointer = function (chart, x, y, text, val) {

  text = toTitleCase(text);
  var w = 70,
      h = 45,
      padding = 10,
      font_size = 11,
      callout = chart.select('svg').append('g')
        .attr('class', 'callout')
        .style("opacity",0),
      pointer = callout.append('rect')
        .attr('class', 'pointer')
        .attr('height', h),
      title = callout.append('text')
        .attr('class', 'callout-title')
        .text(text)
        .attr('x', padding),
      w = Math.max(title[0][0].getBoundingClientRect().width + padding * 2, w),
      x_offset = (x <= chart.width()/2) ? 0 : w ,
      y_offset = (y <= chart.height()/2) ? 2*h : 0,
      points = w/2-padding+','+h+' '+
        + parseInt(x_offset)+','+ parseInt(0-y_offset + h*2) +' '
        + parseInt(w/2+padding)+','+h;

      points = w/2-padding+','+h+' '+
        + parseInt(x_offset)+','+ parseInt(0-y_offset + h*2) +' '
        + parseInt(w/2+padding)+','+h;

  pointer.attr('width', w)
    .attr('x', 0)
    .attr('y', y_offset/2)

  callout.append('polygon')
  .attr('points', points);

  title.attr('y', font_size + padding + y_offset/2);

  callout.append('text')
    .text(val)
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

  chart.selectAll(selector)
    .each(function (d){
      this.addEventListener('mouseover', function (e) {
            var _this = this;
            pointerTimeout = setTimeout(function () {
              drawPointer(chart, e.offsetX, e.offsetY, keyFormatter(d), valueFormatter(d));
            }, 100);
          });
          this.addEventListener('mouseout', function () {
            clearTimeout(pointerTimeout);
            removePointer();
          })
    });

};

Porcelain.registerPlugin('Callout', Callout);