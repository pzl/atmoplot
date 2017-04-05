(function(exports){

	function hover(){
		var data,
			xbounds = [0,1e6],
			ybounds = [0,1e6],
			hover_padding = 50,
			container = null,
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
			
			var tooltip = container.append("g").attr("class","tooltip")
				vGroup = container.append("g").attr("class","voronoi");

			tooltip.attr("transform","translate(-100,-100)");
			tooltip.append("rect")
				.attr("class","tt-bg")
				.attr("x",-100)
				.attr("y",-100)
				.attr("width",0)
				.attr("height",0)
			tooltip.append("text")
				.attr("class","vlabel")
				.text("label")
				.attr("y",-20);
			tooltip.append("circle")
				.attr("class","vhighlight")
				.attr("r",3);

			vGroup.selectAll("path")
				.data(voronoi.extent([[xbounds[0],ybounds[0]-hover_padding],[xbounds[1],ybounds[1]+hover_padding]]).polygons(data))
				.enter().append("path")
				.attr("class","voronoi")
				.attr("d",function(d){return d?"M"+d.join("L")+"Z":null; })
				.on("mouseover",function(d,i,nodes){
					tooltip.attr("transform","translate("+xacc(d.data)+","+yacc(d.data)+")");
					var box = tooltip.select("text")
								.text(label_fmt(d.data))
								.node().getBBox();
					tooltip.select("rect")
						.attr("x",box.x-tooltip_pad)
						.attr("y",box.y-tooltip_pad)
						.attr("width",box.width+tooltip_pad*2)
						.attr("height",box.height+tooltip_pad*2)

				})
				.on("mouseout",function(d,i,nodes){
					tooltip.attr("transform","translate(-100,-100)")
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

		return run;
	}


	exports.tooltip = function(){
		return hover();
	}
})(this);