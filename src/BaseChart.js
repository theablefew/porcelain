function BaseChart (element) {};


Object.defineProperties(BaseChart.prototype, {
    validate: {
      value: function (render_args, render) {
        render.apply(this, render_args);
      }
    }
  , _capabilities: {
        writable: true
      , value   : {}
  }
  , capabilities: {
      get: function () { return this._capabilities; }
  }
  , defineCapability: {
      value: function (capability, definition) {
        var prototype = definition.descriptor.defined_in.prototype;
        prototype._capabilities[capability] = definition.descriptor;
        Object.defineProperty(prototype, '_'+capability, {
            writable  : true
          , enumerable : false
          , value      : definition.descriptor.default
        });
        Object.defineProperty(prototype, capability, definition.property); 
      }
  }
});


BaseChart.prototype.defineCapability(
  'size', {
      property: {
          get        : function ( ) { return this._size; }
        , set        : function (_) { this._size = (_ == 'auto') ? {width: _el.offsetWidth, height: _el.offsetHeight} : _; }
        , enumerable : true
      }
    , descriptor: {
          defined_in  : BaseChart
        , description : 'Sets the width and height of the chart. Accepts a object with "width" and "height" properties or a string "auto", which sets dimensions to that of the prentent element.'
        , default     : {width: 400, height: 400}
        , required    : true
        , type        : 'object @width:int,@height:int'
      }
  });

BaseChart.prototype.defineCapability(
  'margins', {
      property: {
          get: function ( ) { return this._margins; }
        , set: function (_) { this._margins = _; }
        , enumerable: true
      }
    , descriptor: {
          defined_in  : BaseChart
        , description : 'Sets the margins between the chart and the containing dom element. Accepts a object with "top", "right", "bottom" and "left" properties.'
        , default     : {top: 30, right: 30, bottom: 30, left: 30}
        , required    : true
        , type        : 'object @top:int @right:int @bottom:int @left:int'
      }
  });

BaseChart.prototype.defineCapability(
  'theme', {
      property: {
          get        : function ( ) { return this._theme; }
        , set        : function (_) { this._theme = _; }
        , enumerable : true
      }
    , descriptor: {
          defined_in  : BaseChart
        , description : 'Color-set for charted data.'
        , required    : false
        , type        : 'object|array'
      }
  });

BaseChart.prototype.defineCapability(
  'data', {
      property: {
          get        : function ( ) { return this._data; }
        , set        : function (_) { this._data = (typeof _ == 'string') ? JSON.parse(_) : _; }
        , enumerable : true
      }
    , descriptor: {
          defined_in  : BaseChart
        , description : 'Data passed into the chart'
        , required    : true
        , type        : 'JSON'
      }
  });

BaseChart.prototype.defineCapability(
  'element', {
      property: {
          get        : function ( ) { return this._element; }
        , set        : function (_) { this._element = (typeof _ == 'string') ? document.querySelectorAll(_)[0] : _; }
        , enumerable : true
      }
    , descriptor: {
          defined_in  : BaseChart
        , description : 'Element into which to draw the chart. The element passed is either a selector string or a DOM element reference'
        , required    : true
        , type        : 'string|element'
      }
  });

