function BaseChart (element) {

  this.element = element;

};

BaseChart.prototype.update = function() {
  this.chart.remove();
  this.render();
}

Object.defineProperties(BaseChart.prototype, {
    validate: {
      value: function (render_args, render) {
        var self = this
          , valid = true;

        Object.keys(this.capabilities).forEach(function (c) {
          if (self.capabilities[c].required) {
            if(!self[c]) {
              valid = false;
              console.warn('Required capability "'+c+'" not set, skipping render');
            }
          }
        });

        if(valid) render.apply(this, render_args);
      }
    }
  , _activatePlugins: {
      value: function (plugins) {
        for(var p in plugins) {
          if(!Porcelain.plugins[p]) {
            console.warn('Plugin "'+p+'" not registered with Porcelain, skipping plugin initialization');
            continue;
          }
          plugins[p].instance = new Porcelain.plugins[p](this, plugins[p]);
          Object.defineProperty (this, p, {
            value : plugins[p].instance
          });
        }
    }
  }
  , _capabilities: {
        writable: true
      , value   : {}
  }
  , capabilities: {
      get: function () { return this._capabilities; }
  }
  , chart: {
        get        : function ( ) { return this._chart; }
      , set        : function (_) { this._chart = _; }
      , enumerable : false
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
        , type        : 'array'
      }
  });


BaseChart.prototype.defineCapability(
  'element', {
      property: {
          get        : function ( ) { return this._element; }
        , set        : function (_) { this._element = (typeof _ == 'string') ? document.querySelector(_) : _; }
        , enumerable : true
      }
    , descriptor: {
          defined_in  : BaseChart
        , description : 'Element into which to draw the chart. The element passed is either a selector string or a DOM element reference'
        , required    : true
        , type        : 'string'
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
        , type        : 'object'
      }
  });


BaseChart.prototype.defineCapability(
  'plugins', {
      property: {
          get: function ( ) { return this._plugins; }
        , set: function (_) { this._activatePlugins(_); this._plugins = _;
          }
        , enumerable: true
      }
    , descriptor: {
          defined_in  : BaseChart
        , description : 'Attaches the chart instance to the plugin passing options.'
        , default     : {}
        , required    : false
        , type        : 'object'
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
        , type        : 'object'
      }
  });


BaseChart.prototype.defineCapability(
  'theme', {
      property: {
          get        : function ( ) { return this._theme; }
        , set        : function (_) {
          this._theme = _;
          this._domain = [];
          this._range  = [];
          for(var i in _) {
            this._domain.push(i);
            this._range.push(_[i]);
          }
        }
        , enumerable : true
      }
    , descriptor: {
          defined_in  : BaseChart
        , description : 'Color-set for charted data.'
        , default     : {domain: [], range: [Util.randomColor(), Util.randomColor(), Util.randomColor(), Util.randomColor()], name: {}}
        , required    : false
        , type        : 'object'
      }
  });
