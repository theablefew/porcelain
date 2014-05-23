

#Porcelain



##Rendering charts
===

**JavaScript**

	var p = Porcelain.PieChart('#foo');
	
	p.data = [{key: 'foo', value: 45}, {key: 'bar', value: 55}];
	p.size = {width: 400, height: 400};
	p.radius = 150;
	
	p.render('foobar', 'bazqux');

**HTML**


	<div id='bar' class='porcelain-chartable' data-radius='94' data-chart-type='pie-chart' data-data='[{"key": "baz", "value": "90"}, {"key": "qux", "value": "10"}]'></div>
	
**Conventions**

* **data-chart-type** - can be "ChartType" or "chart-type"
* **data-[capability]** - chart capabilities are exposed via the ```data``` attribute. Capabilities should follow ```snake_case``` and are transformed to ```data-snake-case``` on DOM elements.
* **data-capapbilites** - JSON-formatted string to apply multiple capabilites. 


##Inspection
===

####Porcelain.types
**returns** - {object}

Returns all *valid* charts that have registered Porcelain

*example*

	Porcelain.types >>> {
		PieChart:function[constructor],
	...}


####Porcelain.charts
**returns** - [array]

Returns all charts that have been rendered with Porcelain. It does not track if the charts are still on the page.

*example*

	Porcelain.charts >>> [{
		chart : PieChart:[instance],
		node  : #foo[string|node],
		type  : "PieChart"[string]
	}, ...]

####Chart.prototype.capabilities
**returns**  - {object}

Returns the *inclusive* capabilities available on the chart, including those defined in an ancestor.

*example*

	PieChart.prototype.capabilities >>> {
		element: Object
		margins: Object
		radius: Object
		size: Object
		theme: Object 
	}
	

####Chart.prototype.capabilities.[capability]
**returns**  - {object}

Returns the chart capability property descriptor, with the following properties:

* **default** - default value for the property
* **defined_in** - Prototype in which the property was defined
* **description** - Human readable description of property
* **required** - Boolean, will prevent chart from rendering if not set
* **type** - Syntax description of the accepted format. Valid types: ```string, int, float, boolean, JSON```

*example*

	PieChart.prototype.capabilities.radius >>> {
		default     : 100
		defined_in  : function PieChart(element) {
		description : "Outsize radius of the chart"
		required    : false
		type        : "JSON"
	}


##Chart authoring
===

In order for it to be accepted by Porcelain, a chart **must**:

* Declare a constructor, in which an ancestor is passed an instance
* Extend BaseChart, or a chart with *BaseChart* in its prototype chain
* Implement a ```render``` method
* Register itself with Porcelain

*example*

	function PieChart (element) {
	
	  BaseChart.call(this, element);
	
	};


	Util.extendChart(PieChart, BaseChart);


	PieChart.prototype.render = function () {
	
	  var pie = dc.pieChart(this.element)
	        , g_ndx = crossfilter(this.data)
	        , g_dim = g_ndx.dimension(function(d) { return d.key;})
	        , g_grp = g_dim.group().reduceSum(function(d) {return d.value;});
	
	      pie
	        .dimension(g_dim)
	        .group(g_grp)
	        .width(this.size.width)
	        .height(this.size.height)
	        .radius(this.radius)
	        .innerRadius(this.inner_radius);
	
	      pie.render();
	}
	
	Porcelain.register('PieChart', PieChart);

####Adding capabilities	
Charts will most likely implement capabilities native to the chart type. This is done by adding a property to the chart prototype.

**Conventions**

* **capabilitiy_name** - is what will be exposed as a capability. Can overwrite capabilities defined is ancestor prototypes. Multi-word names should be written in ```snake_case```, as they will be transformed to HTML data attributes as ```data-snake-case```.
* **this._instance_variable**  - should be the same as ```capabiltity_name```, preceeded by a single ```_```, used in the getter and setter methods.


*example*

	PieChart.prototype.defineCapability(
	    'radius', {
	        property: {
	            get        : function ( ) { return this._radius; }
	          , set        : function (_) { this._radius = _; }
	          , enumerable : true
	        }
	      , descriptor: {
	            defined_in  : PieChart
	          , description : 'Outsize radius of the pie chart'
	          , default     : 100
	          , required    : false
	          , type        : 'int'
	        }
	    });

####Optional callbacks
All charts can optionally register callback methods before and/or after render, allowing just-in-time data preperation, as well as post-render adjustments.

Simply define ```beforeRender``` and/or ```afterRender``` on the chart's prototype and the following sequence executes:

1. ```Chart.render()``` is called
2. ```Chart.prototype.beforeRender```, executes *if defined*
3. ```BaseChart.prototype.validate```, executes (NOT YET IMPLEMENTED)
4. ```Chart.prototype.render``` executes
5. ```Chart.prototype.afterRender``` executes *if defined*

###Property type-definition and validation
NOT YET IMPLEMENTED
