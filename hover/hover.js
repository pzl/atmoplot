(function(exports){

	function hover(){
		var data,
			xbounds = [0,1e6],
			ybounds = [0,1e6],
			hover_padding = 50,
			container = null,
			axis_lines = true,
			height = null,
			xacc = function(d){ return d[0]; },
			yacc = function(d){ return d[1]; },
			label_fmt = function(d){ return yacc(d)+":"+xacc(d) };

		var voronoi = d3.voronoi();
		var tooltip_pad = 5;

		function run(selection){
			data = d3.merge(selection.data());
			xbounds = d3.extent(data,xacc);
			ybounds = d3.extent(data,yacc);
			voronoi = voronoi.x(xacc).y(yacc);
			container = container ? container : selection;
			
			var tooltip = container.append("g").attr("class","tooltip"),
				vGroup = container.append("g").attr("class","voronoi");

			tooltip.attr("transform","translate(-100,-100)");
			if (axis_lines && height !== null){
				tooltip.append("line")
					.attr("class","tt-xaxis")
					.attr("x1",0).attr("x2",0)
					.attr("y1",0).attr("y2",0)
				tooltip.append("line")
					.attr("class","tt-yaxis")
					.attr("y1",0).attr("y2",0)
					.attr("x1",0).attr("x2",0)

				tooltip.append("text")
					.attr("class","tt-x-label")
					.attr("y",height)
					.attr("x",0)
				container.append("text")
					.attr("class","tt-y-label")
					.attr("y",0)
					.attr("x",0);
			} else {
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
			tooltip.append("circle")
				.attr("class","vhighlight")
				.attr("r",3);

			vGroup.selectAll("path")
				.data(voronoi.extent([[xbounds[0],ybounds[0]-hover_padding],[xbounds[1],ybounds[1]+hover_padding]]).polygons(data))
				.enter().append("path")
				.attr("class","voronoi")
				.attr("d",function(d){return d?"M"+d.join("L")+"Z":null; })
				.on("mouseover",function(d,i,nodes){
					var y = yacc(d.data);
					tooltip.attr("transform","translate("+xacc(d.data)+","+y+")");
					if (axis_lines && height !== null) {
						tooltip.select(".tt-xaxis")
							.attr("y2", height-y );
						tooltip.select(".tt-yaxis")
							.attr("x2",-1*xacc(d.data));

						tooltip.select(".tt-x-label")
							.attr("y",height-y)
							.text(d.data.date)
						container.select(".tt-y-label")
							.text(d.data.value)
							.attr("y",yacc(d.data))
					} else {
						var box = tooltip.select("text")
									.text(label_fmt(d.data))
									.node().getBBox();
						tooltip.select("rect")
							.attr("x",box.x-tooltip_pad)
							.attr("y",box.y-tooltip_pad)
							.attr("width",box.width+tooltip_pad*2)
							.attr("height",box.height+tooltip_pad*2)
					}

				})
				.on("mouseout",function(d,i,nodes){
					tooltip.attr("transform","translate(-100,-100)");
					if (axis_lines) {
						tooltip.select(".tt-xaxis").attr("y2",0)
						tooltip.select(".tt-yaxis").attr("x2",0)
						tooltip.select("text").text("")
						container.select(".tt-y-label").text("")
					} else {
						tooltip.select("text").text("")
					}
				})
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
		run.label = function(format) {
			label_fmt = format;
			return run;
		}
		run.insert = function(element) {
			container = element;
			return run;
		}
		run.lines = function(enabled, h) {
			axis_lines = enabled;
			height=h;
			return run;
		}

		return run;
	}


	exports.tooltip = function(){
		return hover();
	}
})(this);