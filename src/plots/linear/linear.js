	(function(exports){
	/* Creates a linear graph
	* @param container d3 element to put this plot in (like, d3.select('svg') or a g)
	* @param options object optional extra options
	* 
	*
	*/
	function Linear_Plot(container, options){
		var default_opts = {
			width: 800,
			height: 500,
			padding: {
				h: 25,
				v: 25,
			},
			scale: {
				x: d3.scaleLinear,
				y: d3.scaleLinear
			},
			label: {
				x: null,
				y: null
			},
			zero_line: true,
			zoom: true
		};
		options = _optmerge(default_opts,options);
		this.options = options;

		this.chart = container.append("g").attr('class','chart');
		this.plot = this.chart.append("g")
							.attr('class','plot')
							.attr('transform','translate('+options.padding.h+',0)');
		this.scalable = this.plot.append("g").attr('class','scalable');
		this.area_group = this.scalable.append("g").attr("class",'areas');
		this.line_group = this.scalable.append("g").attr("class","lines")

		this.scale_x = options.scale.x().range([0,options.width-options.padding.h-1]);
		this.scale_y = options.scale.y().range([options.height-options.padding.v,5]);

		if (options.zoom){
			var zoom = d3.zoom()
						.scaleExtent([1,10])
						.translateExtent([[0,0],[options.width,options.height]])
						.extent([[0,0],[options.width,options.height]])
						.on("zoom",zoomed(this));
			container.call(zoom);
		}



		this.axes = this.chart.append("g").attr("class","axes");
		this.xaxis = d3.axisBottom(this.scale_x),
		this.yaxis = d3.axisLeft(this.scale_y);
		this.x_ax_group = this.axes.append("g")
							.attr('class','axis axis-x')
							.attr('transform','translate('+options.padding.h+','+(options.height-options.padding.v)+')')
							.call(this.xaxis)
		this.y_ax_group = this.axes.append("g")
							.attr('class','axis axis-y')
							.attr('transform','translate('+options.padding.h+',0)')
							.call(this.yaxis)
		if (options.label.y){
			this.y_ax_group.append("text")
						.attr("class","axis-label axis-label-y")
						.attr("transform","rotate(-90)")
						.attr("y",6)
						.attr("dy","0.71em")
						.text(options.label.y)
		}
		if (options.label.x) {
			this.x_ax_group.append("text")
						.attr("class","axis-label axis-label-x")
						.attr("x",options.width-options.padding.h)
						.attr("y",-2)
						.text(options.label.x)
		}

		this.lines = [];
		this.areas = [];
		this.customs=[];
		this.extents = {
			x: [null,null],
			y: [null,null]
		}

		if (options.zero_line) {
			this.add_custom(function(sx,sy){
				this.scalable.selectAll('.zero-line')
					.data([0])
					.attr('transform','translate(0,'+sy(0)+')')
					.enter()
						.append('line')
						.attr('class','zero-line')
						.attr('x1',0).attr('x2',this.options.width-this.options.padding.h)
						.attr('y1',0).attr('y2',0)
						//.lower()
			})
		}
	}

	Linear_Plot.prototype.rescale = function(scale_x,scale_y) {
		if (!scale_x){ scale_x = this.scale_x; }
		if (!scale_y){ scale_y = this.scale_y; }

		for (var i=0; i<this.lines.length; i++){
			var line = this.lines[i];
			line.line
				 .x(function(d){ return scale_x(line.x(d)); })
				 .y(function(d){ return scale_y(line.y(d)); });
			line.element.attr('d',line.line);
		}
		for (var i=0; i<this.areas.length; i++){
			var area = this.areas[i];
			area.area
				.x(function(d){ return scale_x(area.x(d)); })
				.y0(function(d){return scale_y(area.y0(d)); })
				.y1(function(d){return scale_y(area.y1(d)); });
			area.element.attr('d',area.area);
		}
		for (var i=0; i<this.customs.length; i++){
			this.customs[i].call(this,scale_x,scale_y);
		}

		this.y_ax_group.call(this.yaxis.scale(scale_y))
		this.x_ax_group.call(this.xaxis.scale(scale_x))
	}

	Linear_Plot.prototype.add_line = function(data,options) {
		var that = this;
		var defaults = {
			x: function(d){ return d[0]; },
			y: function(d){ return d[1]; },
			curve: d3.curveLinear
		}
		var options = _optmerge(defaults,options)

		this.extents.x = d3.extent(data.map(options.x).concat(this.extents.x))		
		this.extents.y = d3.extent(data.map(options.y).concat(this.extents.y))
		that.scale_x.domain(this.extents.x);
		that.scale_y.domain(this.extents.y);

		var line = d3.line()
					.x(function(d){ return that.scale_x(options.x(d)) })
					.y(function(d){ return that.scale_y(options.y(d)) })
					.curve(options.curve)
		var element = this.line_group
						//.selectAll('.line').data([data]).enter()
							.append('path')
							.datum(data)
							.attr('class','line')
							.attr('d',line);

		var created = {
			line: line,
			element: element,
			x: options.x,
			y: options.y,
			data: function(d,t) {
				element.datum(d)
				var e = (t ? element.transition(t) : element)
				e.attr('d',line)
			}
		};

		this.lines.push(created);
		this.rescale()
		return created
	}

	Linear_Plot.prototype.add_area = function(data,options) {
		var that = this;
		var defaults = {
			x: function(d){ return d[0]; },
			y0:function(d){ return d[1]; },
			y1:function(d){ return d[2]; },
			curve: d3.curveMonotoneX,
		}
		var options = _optmerge(defaults,options);

		this.extents.x = d3.extent(data.map(options.x).concat(this.extents.x))		
		this.extents.y = d3.extent(data.map(options.y0).concat(data.map(options.y1)).concat(this.extents.y))
		that.scale_x.domain(this.extents.x);
		that.scale_y.domain(this.extents.y);
		var area = d3.area()
					.curve(options.curve)
					.x(function(d){ return that.scale_x(options.x(d)) })
					.y0(function(d){return that.scale_y(options.y0(d))})
					.y1(function(d){return that.scale_y(options.y1(d))});
		var element = this.area_group
						//.selectAll('.area').data([data]).enter()
							.append('path')
							.datum(data)
							.attr('class','area')
							.attr('d',area);

		var created = {
			area: area,
			element: element,
			x: options.x,
			y0: options.y0,
			y1: options.y1,
			data: function(d,t){
				element.datum(d)
				var e = (t ? element.transition(t) : element);
				e.attr('d',area)
			}
		};
		this.areas.push(created);
		this.rescale();
		return created
	}

	Linear_Plot.prototype.add_custom = function(cb) {
		this.customs.push(cb);
		cb.call(this,this.scale_x,this.scale_y);
	}

	function zoomed(that){
		return function(){
			var t = d3.event.transform,
				zoom_x = t.rescaleX(that.scale_x),
				zoom_y = t.rescaleY(that.scale_y);

			that.rescale(zoom_x,zoom_y)
		}
	}
	function _optmerge(a,b){
		for (var attr in b) {
			if (typeof b[attr] === 'object'){
				a[attr] = _optmerge(a[attr],b[attr]);
			} else {
				a[attr] = b[attr];
			}
		}
		return a;
	}


	exports.linear_plot = function(container, width, height, options) {
		return new Linear_Plot(container, width, height, options);
	}
})(this);