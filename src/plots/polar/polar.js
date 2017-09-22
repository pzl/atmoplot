(function(exports){
	/* Creates a radial stereographic plot
	 * @param container d3 element to put this plot in (like, d3.select('svg') or a g)
	 * @param size int pixel size that the square should be. Includes axis labels, so final plot diameter will be slightly smaller
	 *
	 * @return object
	 *           projection: map projection,
	 *           group: the clipper inner-graph group to paint onto
	 */
	function Polar_Plot(container, size, options){
		var default_opts = {
			padding: 50,
			graticule: {
				extentMajor: [[-180,0],[180,89.999999]],
				extentMinor: [[-180,0],[180,80.000001]],
				stepMajor: [90,360],
				stepMinor: [30,10]
			},
			labels: 28,
			scale: 1.75,
		};
		options = _optmerge(default_opts, options);

		var	width = size,
			height = size,
			radius = size/2-options.padding,
			graph = container.append("g"), // to contain text outside of clip
			graph_inner = graph.append("g"); //to be clipped

		graph.attr("transform","translate("+options.padding+","+options.padding+")");

		graph.append("circle")
			.attr("r",radius)
			.attr("cx",radius)
			.attr("cy",radius)
			.attr("class", "polar_graph_border");

		var bound_id = "polar_bounds"+(bounds_counter++);
		container.append("clipPath")
			.attr("id",bound_id)
			.append("circle")
				.attr("r",radius)
				.attr("cx",radius)
				.attr("cy",radius);

		graph_inner.attr("clip-path","url(#"+bound_id+")");

		var projection = d3.geoStereographic()
			.scale(radius*options.scale)
			.translate([width/2-options.padding, height/2-options.padding])
			.rotate([180,-90])
			.clipAngle(181)
			.clipExtent([[0,0], [width-options.padding,height-options.padding]])
			.precision(.1);

		var path = d3.geoPath()
			.projection(projection);

		var graticule = d3.geoGraticule()
			.extentMajor(options.graticule.extentMajor)
			.extentMinor(options.graticule.extentMinor)
			.stepMajor(options.graticule.stepMajor)
			.stepMinor(options.graticule.stepMinor)
		graph_inner.append("path")
			.datum(graticule)
			.attr("class", "polar_graticule")
			.attr("d",path);
		graph.selectAll(".polar_lons")
			.data(d3.range(0,360,30))
			.enter()
			.append("text")
			.attr("class", "polar_lons")
			.text(function(d){
				if (d===0||d===180){
					return d;
				}
				return (d<180)?d+"E":(180-(d-180))+"W";
			})
			.attr("x",function(d){ return projection([d,options.labels])[0] })
			.attr("y",function(d){ return projection([d,options.labels])[1] });

		d3.json("https://unpkg.com/world-atlas@1/world/50m.json", function(error, world) {
			if (error) throw error;

			graph_inner.insert("path", ".polar_graticule")
				.datum(topojson.feature(world, world.objects.land))
				.attr("class", "polar_land")
				.attr("d", path);

			graph_inner.insert("path", ".polar_graticule")
				.datum(topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }))
				.attr("class", "polar_boundary")
				.attr("d", path);

		});
		this.projection = projection;
		this.group = graph_inner;
	}

	function _optmerge(a,b) {
		for (var attr in b) {
			if ( typeof b[attr] === 'object' ){
				a[attr] = _optmerge(a[attr],b[attr]);
			} else {
				a[attr] = b[attr];
			}
		}
		return a;
	}

	var bounds_counter=0; //each plot needs a globally-unique clip-path ID. Maybe better to do this than some rand() digits to prevent collisions

	window.topojson || document.write('<script src="https://unpkg.com/topojson@3"></script>');

	/**
	 * @todo: automatically place labels based on scale
	 * @todo: only load 50m.json once, store on object?
	 * @todo: loading animation, or on 'progress' load bar https://bl.ocks.org/mbostock/3750941
	 */

	 exports.polar_plot = function(container,size,options) {
	 	return new Polar_Plot(container,size,options);
	 }

})(this);