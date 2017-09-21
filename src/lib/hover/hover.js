(function(exports){

	function hover(){
		var data,
			xbounds = [0,1e6],
			ybounds = [0,1e6],
			hover_padding = 50,
			vcontainer = null,
			tt_container = null,
			axis_lines = true,
			height = null,
			xacc = function(d){ return d[0]; },
			yacc = function(d){ return d[1]; },
			label_x = function(d){ return d[0]; },
			label_y = function(d){ return d[1]; }

		var voronoi = d3.voronoi();
		var tooltip_pad = 5;

		function run(selection){
			data = d3.merge(selection.data());
			xbounds = d3.extent(data,xacc);
			ybounds = d3.extent(data,yacc);
			voronoi = voronoi.x(xacc).y(yacc);
			vcontainer = vcontainer ? vcontainer : selection;
			tt_container = tt_container ? tt_container : vcontainer;
			
			var tooltip = _create_tooltip_elements();
			var vGroup;
			if ( vcontainer.select(".voronoi").size() > 0 ){
				vGroup = d3.select(".voronoi");
			} else {
				vGroup = vcontainer.append("g").attr("class","voronoi");
			}

			// ------ VORONOI work

			// Data JOIN
			var v_paths = vGroup.selectAll("path")
							.data(voronoi.extent([[xbounds[0],ybounds[0]-hover_padding],[xbounds[1],ybounds[1]+hover_padding]]).polygons(data));

			v_paths.exit().remove();

			v_paths.enter().append("path")
				.attr("class","voronoi")
				.merge(v_paths)
				.attr("d",function(d){return d?"M"+d.join("L")+"Z":null; })
				.on("mouseover",function(d,i,nodes){
					var y = yacc(d.data),
						x = xacc(d.data);
					tooltip.attr("transform","translate("+x+","+y+")");
					if (axis_lines && height !== null) {
						tooltip.select(".tt-xaxis")
							.attr("y2", height-y );
						tooltip.select(".tt-yaxis")
							.attr("x2",-x);

						tooltip.select(".tt-x-label")
							.attr("y",height-y-5)
							.text(label_x(d.data))
							.call(function(sel){
								var tlen = sel.node().getBBox(),
									tspace = 5;
								if ( tlen.width + tspace > x ){
									sel.style("text-anchor", "start" )
										.attr("x",tspace);
								} else {
									sel.style("text-anchor","end")
										.attr("x",-tspace)
								}
							})
						tt_container.select(".tt-y-label")
							.text(label_y(d.data))
							.attr("x",5)
							.call(function(sel){
								var theight = sel.node().getBBox().height,
									tspace = 5;
								if ( theight + tspace > y ){
									sel.attr("y",y+theight+tspace)
								} else {
									sel.attr("y",y-tspace)
								}
							})
					} else {
						var box = tooltip.select("text")
									.text(label_x(d.data)+"\n"+label_y(d.data))
									.node().getBBox();
						tooltip.select("rect")
							.attr("x",box.x-tooltip_pad)
							.attr("y",box.y-tooltip_pad)
							.attr("width",box.width+tooltip_pad*2)
							.attr("height",box.height+tooltip_pad*2)
					}

				})
				.on("mouseout",function(d,i,nodes){
					_hide();
				})
		}

		function _create_tooltip_elements(){
			if ( tt_container.select(".tooltip").size() > 0 ){
				return tt_container.select(".tooltip");
				// @ todo: this does not account for changing from
				// line-style to box-style
			}

			var tooltip = tt_container.append("g").attr("class","tooltip");

			tooltip.attr("transform","translate(-100,-100)");
			if (axis_lines && height !== null){
				_create_tt_lines(tooltip);
			} else {
				_create_tt_box(tooltip);
			}
			tooltip.append("circle")
				.attr("class","vhighlight")
				.attr("r",3);

			return tooltip;
		}

		function _create_tt_lines(tooltip){
			tooltip.append("line")
				.attr("class","tt-xaxis")
				.attr("x1",0).attr("x2",0.00001) //to create a non-zero bounding box for gradient to work
				.attr("y1",0).attr("y2",0)
			tooltip.append("line")
				.attr("class","tt-yaxis")
				.attr("y1",0).attr("y2",0.00001)
				.attr("x1",0).attr("x2",0)

			tooltip.append("text")
				.attr("class","tt-x-label")
				.attr("y",0)
				.attr("x",0)
			tt_container.append("text")
				.attr("class","tt-y-label")
				.attr("y",0)
				.attr("x",0);

			//create gradient. I wish more could be handled in CSS
			var defs = tt_container.append("defs");
			var hgrad = defs.append("linearGradient")
				.attr("id","tt_hgrad")
				//.attr("gradientUnits","userSpaceOnUse")
				.attr("x1","0%")
				.attr("y1","0%")
				.attr("x2","100%")
				.attr("y2","0%");
			hgrad.append("stop")
				.attr("class","tt_line_stop_begin")
				.attr("offset","0%")
			hgrad.append("stop")
				.attr("class","tt_line_stop_end")
				.attr("offset","100%")
			var vgrad = defs.append("linearGradient")
				.attr("id","tt_vgrad")
				.attr("xlink:xlink:href","#tt_hgrad")
				.attr("x2","0%")
				.attr("y1","100%")
		}
		function _create_tt_box(){
			tooltip.append("rect")
				.attr("class","tt-bg")
				.attr("x",-100)
				.attr("y",-100)
				.attr("width",0)
				.attr("height",0)
			tooltip.append("text")
				.attr("class","vlabel")
				.attr("y",-20);
		}

		function _hide(){
			var tooltip = tt_container.select('.tooltip');
			tooltip.attr("transform","translate(-100,-100)");
			if (axis_lines) {
				tooltip.select(".tt-xaxis").attr("y2",0)
				tooltip.select(".tt-yaxis").attr("x2",0)
				tooltip.select("text").text("")
				tt_container.select(".tt-y-label").text("")
			} else {
				tooltip.select("text").text("")
			}
		}

		run.x = function(x) {
			xacc = x;
			return run;
		}
		run.y = function(y) {
			yacc = y;
			return run;
		}
		run.pad = function(padding) {
			hover_padding = padding;
			return run;
		}
		run.xLabel = function(format) {
			label_x = format;
			return run;
		}
		run.yLabel = function(format) {
			label_y = format;
			return run;
		}
		run.insert = function(element) {
			vcontainer = element;
			return run;
		}
		run.insert_tooltip = function(element) {
			tt_container = element;
			return run;
		}
		run.lines = function(enabled, h) {
			axis_lines = enabled;
			height=h;
			return run;
		}
		run.hide = function(){
			_hide();
			return run;
		}

		return run;
	}


	exports.tooltip = function(){
		return hover();
	}
})(this);