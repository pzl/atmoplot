(function(exports){

	function hover(){
		var data,
			xbounds = [0,1e6],
			ybounds = [0,1e6],
			hover_padding = 50,
			container = null,
			xacc = function(d){ return d; },
			yacc = function(d){ return d; },
			label_fmt = function(d){ return yacc(d)+":"+xacc(d) };

		var voronoi = d3.voronoi();

		function run(selection){
			data = d3.merge(selection.data());
			xbounds = d3.extent(data,xacc);
			ybounds = d3.extent(data,yacc);
			voronoi = voronoi.x(xacc).y(yacc);
			container = container ? container : selection;
			
			var vGroup = container.append("g").attr("class","voronoi");
			vGroup.selectAll("path")
				.data(voronoi.extent([[xbounds[0],ybounds[0]-hover_padding],[xbounds[1],ybounds[1]+hover_padding]]).polygons(data))
				.enter().append("path")
				.attr("class","voronoi")
				.attr("d",function(d){return d?"M"+d.join("L")+"Z":null; })
				.on("mouseover",function(d,i,nodes){
					container.append("text")
						.attr("class","vlabel")
						.text(label_fmt(d.data))
						.attr("x",xacc(d.data))
						.attr("y",yacc(d.data)-20)
					container.append("circle")
						.attr("class","vhighlight")
						.attr("r",3)
						.attr("cx",xacc(d.data))
						.attr("cy",yacc(d.data))
				})
				.on("mouseout",function(d,i,nodes){
					container.select(".vlabel").remove();
					container.select(".vhighlight").remove();
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